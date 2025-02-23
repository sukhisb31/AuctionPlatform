import { User } from "../models/user.model.js";
import { Auction } from "../models/auctionModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";

// check active auction or not\

export const addNewAuctionItem = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Auction image is required", 400));
  }
  const { image } = req.files;

  // validate image format
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(image.mimetype)) {
    return next(new ErrorHandler("Invalid image format", 400));
  }


// check error in validation
const {
  title,
  description,
  startTime,
  endTime,
  condition,
  category,
  startingBid,
} = req.body;

// check all fields
if (
  !title ||
  !description ||
  !startTime ||
  !endTime ||
  !condition ||
  !category ||
  !startingBid
) {
  return next(new ErrorHandler("please provide all details", 400));
}
if (new Date(startTime) < Date.now()) {
  return next(
    new ErrorHandler(
      "Auction starting time must be greater than present time",
      400
    )
  );
}
if (new Date(startTime) >= new Date(endTime)) {
  return next(
    new ErrorHandler("Auction time must be less then ending time", 400)
  );
}

// check one user any auction active or not if active then throw error to wait for finish auction
const activeOneAuction = await Auction.find({
  createdBy: req.user._id,
  endTime: { $gt: Date.now() },
});
if (activeOneAuction.length > 0) {
  return next(new ErrorHandler("You have already running one auction", 400));
}
try {
  const cloudinaryResponse = await cloudinary.uploader.upload(
    image.tempFilePath,
    {
      folder: "AUCTION_PLATFORM_AUCTIONS",
    }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "cloudinary Error : ",
      cloudinaryResponse.error || "Unknown cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload image in cloudinary", 500));
  }
  // create auction
  const auctionItem = await Auction.create({
    title,
    description,
    startTime,
    endTime,
    condition,
    category,
    startingBid,
    image: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    createdBy : req.user._id,
  });
  return res.status(201).json({
    success: true,
    message: `Auction item created and will be listed on auction page at ${startTime}`,
    auctionItem,
  });
} catch (error) {
  return next(
    new ErrorHandler(error.message || "failed to create auction", 500)
  );
}
});
