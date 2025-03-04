import express from "express";
import {
  deleteAuctionItem,
  getAllPaymentProofs,
  getPaymentProofDetail,
  updateProofStatus,
  deletePaymentProof,
  fetchAllUsers,
  monthlyRevenue,
} from "../controllers/adminController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const userRouter = express.Router();
userRouter.delete(
  "/auctionitem/delete/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteAuctionItem
);

userRouter.get(
  "/paymentproofs/getall",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllPaymentProofs
);
userRouter.get(
  "/paymentproof/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  getPaymentProofDetail
);
userRouter.put(
  "/paymentproof/status/update/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateProofStatus
);
userRouter.delete(
  "/paymentproof/delete/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deletePaymentProof
);

userRouter.get("/users/getall", isAuthenticated, isAuthorized("Admin"), fetchAllUsers);
userRouter.get("/monthlyincome", isAuthenticated, isAuthorized("Admin"), monthlyRevenue)

export default userRouter;
