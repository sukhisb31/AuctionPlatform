import { User } from "../models/user.model.js";
import { Auction } from "../models/auctionModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import {v2 as cloudinary} from "cloudinary";
import {Bid} from "../models/bidSchema.js";
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

// get all auction items
export const getAllItems = catchAsyncError(async(req,res,next) => {
  let items = await Auction.find();
  res.status(200).json({
    success : true,
    items,
  })
});


// get auction details
export const getAuctionDetails = catchAsyncError(async(req,res,next) => {
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
    return next(new ErrorHandler("Invalid id format",400));
  }
  //get auction item
  const auctionItem = await Auction.findById(id);
  if(!auctionItem){
    return next (new ErrorHandler("Auction item is not find", 404));
  }
  //get all bids on this auction
  const bidders = auctionItem.bids.sort((a,b)=> b.bid - a.bid);
  res.status(200).json({
    success : true,
    auctionItem,
    bidders
  })
});

// get my auction items
export const getMyAuctionItems = catchAsyncError(async(req,res,next) => {
  const items = await Auction.find({createdBy : req.user._id});
  res.status(200).json({
    success :true,
    items,
  })
});
export const removeFromAuction = catchAsyncError(async(req,res,next) => {
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
    return next(new ErrorHandler("Invalid id format",400));
  }
  //get auction item
  const auctionItem = await Auction.findById(id);
  if(!auctionItem){
    return next (new ErrorHandler("Auction item is not find", 404));
  }
  await auctionItem.deleteOne();
  res.status(200).json({
    success: true,
    message: " auction item deleted successfully",
  })
});

//Republish end auction item 
export const republishItem = catchAsyncError(async(req,res,next) => {
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
    return next (new ErrorHandler("Invalid id format",400));
  }
  // get auction item
  let auctionItem = await Auction.findById(id);
  if(!auctionItem){
    return next(new ErrorHandler("Auction item is not find",404));
  }

  // start time and end time update after republish
  if(!req.body.startTime || !req.body.endTime){
    return next(new ErrorHandler("Please provide start and end time",400));
  }
  //check auction time
  if(new Date(auctionItem.endTime) > Date.now()){
    return next(new ErrorHandler("Auction item is not ended yet",400));
  }
  let data = {
    startTime : new Date(req.body.startTime),
    endTime : new Date(req.body.endTime),
  }
  // check auction time
  if(data.startTime < Date.now()){
    return next (new ErrorHandler("Auction starting time must be greater than present time", 400))
  }
  if(data.startTime >= data.endTime){
      return next (new ErrorHandler("Auction item less then ending time", 400))
  };

  //if highest bidder
  if(auctionItem.highestBidder){
    const highestBidder = await User.findById(auctionItem.highestBidder);
    highestBidder.moneySpent -= auctionItem.currentBid;
    highestBidder.auctionsWon -= -1;
    highestBidder.save();
  }

  data.bids = [];
  data.commissionCalculated = false;
  data.currentBid = 0;
  data.highestBidder = null;
  auctionItem = await Auction.findByIdAndUpdate(id, data,{
    new : true,
    runValidators : true,
    userFindAndModify : false
  });

  // delete all auctions
  await Bid.deleteMany({auctionItem : auctionItem._id});
//update current Bid 
  const createdBy = await User.findByIdAndUpdate(req.user._id, {unpaidCommission : 0},{
    new : true,
    runValidators : false,
    userFindAndModify : false
  });
  
  res.status(200).json({
    success : true,
    message : `Auction item republished Successfully and will be listed on auction page at ${req.body.startTime}`,
    auctionItem,
  })
});

