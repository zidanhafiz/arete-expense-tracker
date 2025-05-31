import { Router } from "express";
import userController from "../controllers/user.controllers";
import { checkJwt } from "../middlewares/auth.middlewares";
import "../swagger/auth.swagger";

const authRouter: Router = Router();

authRouter.post("/register", userController.registerUser);
authRouter.post("/login", userController.loginUser);
authRouter.post("/refreshToken", userController.refreshToken);
authRouter.get("/getUserInfo", checkJwt, userController.getUser);

export default authRouter;
