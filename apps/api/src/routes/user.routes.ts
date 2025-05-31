import { Router } from "express";
import userController from "../controllers/user.controllers";
import { checkUser } from "../middlewares/user.middlewares";
import "../swagger/user.swagger";

const userRouter: Router = Router();

userRouter.get("/:id", checkUser, userController.getUser);
userRouter.put("/:id", checkUser, userController.updateUser);
userRouter.delete("/:id", checkUser, userController.deleteUser);

export default userRouter;
