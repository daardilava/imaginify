"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { v2 as cloudinary } from 'cloudinary';

// Definición de tipos
interface AddImageParams {
  image: {
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: object;
    secureURL: string;
    transformationURL: string;
    aspectRatio?: string;
    prompt?: string;
    color?: string;
  };
  userId: string;
  path: string;
}

interface UpdateImageParams {
  image: {
    _id: string;
    title?: string;
    publicId?: string;
    transformationType?: string;
    width?: number;
    height?: number;
    config?: object;
    secureURL?: string;
    transformationURL?: string;
    aspectRatio?: string;
    prompt?: string;
    color?: string;
  };
  userId: string;
  path: string;
}

interface ImageDocument {
  _id: string;
  title: string;
  publicId: string;
  transformationType: string;
  width: number;
  height: number;
  config: object;
  secureURL: string;
  transformationURL: string;
  aspectRatio?: string;
  prompt?: string;
  color?: string;
  author: string | {
    _id: string;
    firstName: string;
    lastName: string;
    clerkId: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface GetAllImagesParams {
  limit?: number;
  page: number;
  searchQuery?: string;
}

interface GetUserImagesParams {
  limit?: number;
  page: number;
  userId: string;
}

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function para poblar datos de usuario
const populateUser = (query: any) => query.populate({
  path: 'author',
  model: User,
  select: '_id firstName lastName clerkId'
});

// ADD IMAGE - Añadir una nueva imagen
export async function addImage({ image, userId, path }: AddImageParams): Promise<ImageDocument | null> {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);
    if (!author) throw new Error("User not found");

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error, "Failed to add image");
    return null;
  }
}

// UPDATE IMAGE - Actualizar una imagen existente
export async function updateImage({ image, userId, path }: UpdateImageParams): Promise<ImageDocument | null> {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);
    if (!imageToUpdate || imageToUpdate.author.toString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    );

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error, "Failed to update image");
    return null;
  }
}

// DELETE IMAGE - Eliminar una imagen
export async function deleteImage(imageId: string): Promise<void> {
  try {
    await connectToDatabase();
    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error, "Failed to delete image");
  } finally {
    redirect('/');
  }
}

// GET IMAGE BY ID - Obtener una imagen por su ID
export async function getImageById(imageId: string): Promise<ImageDocument | null> {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));
    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error, "Failed to get image by ID");
    return null;
  }
}

// GET ALL IMAGES - Obtener todas las imágenes con paginación
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = ''
}: GetAllImagesParams): Promise<{
  data: ImageDocument[];
  totalPage: number;
  savedImages: number;
} | null> {
  try {
    await connectToDatabase();

    let expression = 'folder=imaginify';
    if (searchQuery) expression += ` AND ${searchQuery}`;

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);
    let query = searchQuery ? { publicId: { $in: resourceIds } } : {};

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error, "Failed to get all images");
    return null;
  }
}

// GET USER IMAGES - Obtener imágenes de un usuario específico
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: GetUserImagesParams): Promise<{
  data: ImageDocument[];
  totalPages: number;
} | null> {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error, "Failed to get user images");
    return null;
  }
}