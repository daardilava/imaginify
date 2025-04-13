"use server";

import { revalidatePath } from "next/cache";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await User.create(user);
    return newUser.toObject(); // más limpio que JSON.parse(JSON.stringify(...))
  } catch (error) {
    handleError(error, "Error creating user");
    return null;
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    if (!userId) {
      throw new Error("No userId provided to getUserById()");
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId }).lean();

    if (!user) {
      console.warn(`User not found for clerkId: ${userId}`);
      return null; // o lanza error si lo prefieres
    }

    return user;
  } catch (error) {
    handleError(error, "Error fetching user by ID");
    return null;
  }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    if (!clerkId) throw new Error("No clerkId provided to updateUser()");

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedUser) {
      console.warn(`User not found or update failed for clerkId: ${clerkId}`);
      return null;
    }

    return updatedUser;
  } catch (error) {
    handleError(error, "Error updating user");
    return null;
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    if (!clerkId) throw new Error("No clerkId provided to deleteUser()");

    await connectToDatabase();

    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      console.warn(`User to delete not found: ${clerkId}`);
      return null;
    }

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? deletedUser.toObject() : null;
  } catch (error) {
    handleError(error, "Error deleting user");
    return null;
  }
}

// UPDATE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    if (!userId || typeof creditFee !== "number") {
      throw new Error("Invalid parameters in updateCredits()");
    }

    await connectToDatabase();

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUserCredits) {
      console.warn(`Credit update failed for user: ${userId}`);
      return null;
    }

    return updatedUserCredits;
  } catch (error) {
    handleError(error, "Error updating user credits");
    return null;
  }
}
