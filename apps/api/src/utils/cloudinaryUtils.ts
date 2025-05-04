import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { logger } from "../config/logger";

export const uploadImagesToCloudinary = async (
  files: Express.Multer.File[],
  dest: string
) => {
  const options: UploadApiOptions = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    folder: dest,
  };

  try {
    const results = await Promise.all(
      files.map((file) => {
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        return cloudinary.uploader.upload(fileStr, options);
      })
    );
    return results.map((result) => result.secure_url);
  } catch (error) {
    logger.error(`Error uploading images: ${error}`);
    throw error;
  }
};

export const deleteImageFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error(`Error deleting image: ${error}`);
    throw error;
  }
};

export const getPublicIdFromUrl = (url: string) => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  const result = match ? match[1] : null;
  if (result) {
    // Remove file extension (like .jpg, .png, etc.)
    return result.replace(/\.[^/.]+$/, "");
  }
  return result;
};
