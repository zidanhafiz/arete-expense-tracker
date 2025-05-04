import { Request, Response } from "express";
import {
  deleteImageFromCloudinary,
  uploadImagesToCloudinary,
} from "../utils/cloudinaryUtils";
import { logger } from "../config/logger";
import { handleError } from "../utils/errorHandling";

const uploadImages = async (req: Request, res: Response) => {
  try {
    const { files } = req;

    if (!files || files.length === 0) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const uploadedImages = await uploadImagesToCloudinary(
      files as Express.Multer.File[],
      "images"
    );

    logger.info(`Uploaded ${uploadedImages.length} images`);
    res.json({
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    logger.error(`Error uploading images: ${error}`);
    handleError(error, res);
  }
};

const updateImage = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.query;
    const { file } = req;

    if (!publicId || !file) {
      res.status(400).json({ message: "No publicId or file provided" });
      return;
    }

    await deleteImageFromCloudinary(publicId.toString());

    logger.info(`Deleted image with publicId: ${publicId}`);

    const uploadedImage = await uploadImagesToCloudinary(
      [file as Express.Multer.File],
      "images"
    );

    logger.info(`Uploaded image with publicId: ${uploadedImage}`);

    res.json({ message: "Image updated successfully", image: uploadedImage });
  } catch (error) {
    logger.error(`Error updating image: ${error}`);
    handleError(error, res);
  }
};

const deleteImage = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.query;

    if (!publicId) {
      res.status(400).json({ message: "No publicId provided" });
      return;
    }

    await deleteImageFromCloudinary(publicId.toString());

    logger.info(`Deleted image with publicId: ${publicId}`);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting image: ${error}`);
    handleError(error, res);
  }
};

const imagesController = {
  uploadImages,
  updateImage,
  deleteImage,
};

export default imagesController;
