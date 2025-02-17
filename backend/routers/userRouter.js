import express from "express";
import { login, register, getProfile } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post ("/register", register);
userRouter.post("/login", login);
userRouter.get("/me", isAuthenticated ,getProfile)

export default userRouter;