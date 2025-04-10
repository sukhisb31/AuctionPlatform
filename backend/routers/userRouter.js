import express from "express";
import { login, register, getProfile, logout, fetchLeaderboard } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post ("/register", register);
userRouter.post("/login", login);
userRouter.get("/me", isAuthenticated ,getProfile);
userRouter.get("/logout", isAuthenticated ,logout);
userRouter.get ("/leaderboard", fetchLeaderboard);

export default userRouter;