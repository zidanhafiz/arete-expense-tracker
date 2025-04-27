import { Router } from "express";
import userController from "../controllers/user.controllers";
import { checkUser } from "../middlewares/user.middlewares";
import { upload } from "../config/multer";

const userRouter: Router = Router();

userRouter.get("/:id", checkUser, userController.getUser);
userRouter.put("/:id", checkUser, userController.updateUser);
userRouter.delete("/:id", checkUser, userController.deleteUser);

userRouter.post(
  "/uploadAvatar",
  upload.single("avatar"),
  userController.uploadAvatar
);

export default userRouter;
