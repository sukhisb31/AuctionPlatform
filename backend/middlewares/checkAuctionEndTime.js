import { Auction } from "../models/auctionModel.js";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import mongoose from "mongoose";

export const checkAuctionEndTime = catchAsyncError(async(req,res,next) => {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next (new ErrorHandler("Invalid id Format", 400));
    };

    const auction = await Auction.findById(id);
    if(!auction){
        return next (new ErrorHandler("Auction not found", 404));
    };
    const now = new Date();
    if(new Date(auction.startTime) > now){
        return next (new ErrorHandler("Auction not started yet", 400));
    }
    if(new Date(auction.endTime) < now){
        return next(new ErrorHandler("Auction is ended"));
    }
    next();
})