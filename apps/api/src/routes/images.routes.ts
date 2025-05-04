import { Router } from "express";
import { upload } from "../config/multer";
import imagesController from "../controllers/images.controllers";

const imagesRouter: Router = Router();

imagesRouter.post(
  "/upload",
  upload.array("images", 3),
  imagesController.uploadImages
);

imagesRouter
  .route("/")
  .put(upload.single("image"), imagesController.updateImage)
  .delete(imagesController.deleteImage);

export default imagesRouter;
