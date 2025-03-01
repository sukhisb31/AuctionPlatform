import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
  addNewAuctionItem,
  getAllItems,
  getAuctionDetails,
  getMyAuctionItems,
  removeFromAuction,
  republishItem,
} from "../controllers/auctionItemController.js";
import express from "express";
import { trackCommissionStatus } from "../middlewares/trackCommissionStatus.js";

const userRouter = express.Router();

userRouter.put(
  "/item/republish/:id",
  isAuthenticated,
  isAuthorized("Auctioneer"),
  republishItem
);
userRouter.post(
  "/create",
  isAuthenticated,
  isAuthorized("Auctioneer"),
  trackCommissionStatus,
  addNewAuctionItem
);
userRouter.get("/allitems", getAllItems);
userRouter.get("/auction/:id", isAuthenticated, getAuctionDetails);
userRouter.get("/myItems", isAuthenticated, isAuthorized("Auctioneer"), getMyAuctionItems);
userRouter.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Auctioneer"),
  removeFromAuction
);
userRouter.put("/item/republish/:id", isAuthenticated, isAuthorized("Auctioneer"), republishItem);

export default userRouter;
