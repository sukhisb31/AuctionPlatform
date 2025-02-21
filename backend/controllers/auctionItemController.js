

import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.model.js";
import { Auction } from "../models/auctionModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";

// create new auction item function
const addNewAuctionItem = catchAsyncError(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next (new ErrorHandler('Auction Item image required'));
    };
    const {image} = req.files;

    // check image format
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if(!allowedFormats){
        return next (new ErrorHandler("Invalid image format"));
    };
});

// check error in validation 
const {title,description, endTime,startTime,startingBid,condition, category} =  req.body;

// if fields are empty throw error and said to fill all fields
if(!title || !description || !endTime || !startTime || !startingBid || !condition || !category){
    return next (new ErrorHandler ("request to fill all fields ", 400));
};

// check auction time
if(new Date(startTime) < Date.now()){
    return next (new ErrorHandler ("Auction starting time greater than present time ", 400));
};
if(new Date(startTime) >= new Date(endTime)){
    return next (new ErrorHandler ("Auction time must be less then ending time", 400));
};

// check one user any auction active or not if active then throw error to wait for finish auction
const activeOneAuction = await Auction.find({
    createdBy : req.user._id,
    endTime : {$gt : Date.now()},
});
if(activeOneAuction){
    return next (new ErrorHandler("you have already running one Auction", 400));
}
try {
    const cloudinaryResponse = await cloudinary.uploader.upload(
        image.tempFilePath,
        {
            folder : "AUCTION_PLATFORM_AUCTION"
        }
    );
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error(
        "cloudinary Error : ", cloudinaryResponse.error || "unknown cloudinary error"
        );
        return next( new ErrorHandler("Fai to upload auction image in cloudinary", 500))
        
    }
    
} catch (error) { 
    
}

