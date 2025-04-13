"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User, { IUser } from "../database/models/user.model";

// Definición de tipos extendidos para Mongoose
interface MongooseUser extends IUser {
  _id: string;
  __v?: number;
}

type LeanUserDocument = MongooseUser & {
  createdAt?: Date;
  updatedAt?: Date;
};

// CREATE USER
export async function createUser(user: CreateUserParams): Promise<LeanUserDocument | null> {
  try {
    await connectToDatabase();
    
    const newUser = await User.create(user);
    
    if (!newUser) {
      throw new Error("User creation failed");
    }
    
    return JSON.parse(JSON.stringify(newUser.toObject()));
  } catch (error) {
    handleError(error, "Error creating user");
    return null;
  }
}

// READ USER BY ID
export async function getUserById(userId: string): Promise<LeanUserDocument | null> {
  try {
    if (!userId) throw new Error("Missing userId");

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId }).lean<LeanUserDocument>();
    
    if (!user) {
      console.warn(`User not found for clerkId: ${userId}`);
      return null;
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error, "Error fetching user by ID");
    return null;
  }
}

// UPDATE USER
export async function updateUser(
  clerkId: string,
  user: UpdateUserParams
): Promise<LeanUserDocument | null> {
  try {
    if (!clerkId) throw new Error("Missing clerkId");

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      user,
      { new: true, runValidators: true }
    ).lean<LeanUserDocument>();

    if (!updatedUser) {
      console.warn(`User update failed for clerkId: ${clerkId}`);
      return null;
    }

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error, "Error updating user");
    return null;
  }
}

// DELETE USER
export async function deleteUser(clerkId: string): Promise<LeanUserDocument | null> {
  try {
    if (!clerkId) throw new Error("Missing clerkId");

    await connectToDatabase();

    const userToDelete = await User.findOne({ clerkId }).lean<LeanUserDocument>();
    
    if (!userToDelete) {
      console.warn(`User not found for deletion: ${clerkId}`);
      return null;
    }

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser.toObject())) : null;
  } catch (error) {
    handleError(error, "Error deleting user");
    return null;
  }
}

// UPDATE CREDITS
export async function updateCredits(
  userId: string,
  creditFee: number
): Promise<LeanUserDocument | null> {
  try {
    if (!userId || typeof creditFee !== "number") {
      throw new Error("Invalid parameters");
    }

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true, runValidators: true }
    ).lean<LeanUserDocument>();

    if (!updatedUser) {
      console.warn(`Credit update failed for user: ${userId}`);
      return null;
    }

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error, "Error updating credits");
    return null;
  }
}

// Interfaces auxiliares
interface CreateUserParams {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
}

interface UpdateUserParams extends Partial<CreateUserParams> {
  creditBalance?: number;
}