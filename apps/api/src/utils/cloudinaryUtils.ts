import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { logger } from "../config/logger";

export const uploadImage = async (file: Express.Multer.File, dest: string) => {
  const options: UploadApiOptions = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    folder: dest,
  };

  try {
    const result = await cloudinary.uploader.upload(file.path, options);
    return result.public_id;
  } catch (error) {
    logger.error(`Error uploading image: ${error}`);
    throw error;
  }
};

export const getImageUrl = async (publicId: string) => {
  try {
    const result = await cloudinary.url(publicId);
    return result;
  } catch (error) {
    logger.error(`Error getting image url: ${error}`);
    throw error;
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error(`Error deleting image: ${error}`);
    throw error;
  }
};

export const getPublicId = (url: string) => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  const result = match ? match[1] : null;
  return result;
};
