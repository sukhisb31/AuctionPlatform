import express from "express";
import { proofOfCommission } from "../controllers/commissionController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/proof", isAuthenticated, isAuthorized("Auctioneer"), proofOfCommission);

export default userRouter;