import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import {User} from "../models/user.model.js";
import {PaymentProof} from "../models/commissionProofSchema.js";
import ErrorHandler from "../middlewares/error.js";
import {v2 as cloudinary} from "cloudinary";
import { Auction } from "../models/auctionModel.js";
import mongoose from "mongoose";
//calculate commission
export const calculateCommission = async(auctionId) => {
    const auction = await Auction.findById(auctionId);
    if(!mongoose.Types.ObjectId.isValid(auctionId)){
        return next (new ErrorHandler("Invalid auction id format ", 400));
    };
    const commissionRate = 0.05;
    const commission = auction.currentBid * commissionRate;
    return commission;
}

export const proofOfCommission = catchAsyncError(async(req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        return next (new ErrorHandler("Payment proof required", 400));
    };

    const {proof} = req.files;
    const {amount, comment} = req.body;
    const user = await User.findById(req.user._id);

    //amount and comment are required, comment like auction description or auction product 
    if(!amount || !comment) {
        return next (new ErrorHandler("amount and comments are required ", 400))
    };

    if(user.unpaidCommission === 0){
        return res.status(200).json({
            success : true,
            message : "You have no unpaid commission",
        });
    };
    // if auctioneer paid less commission according to auction
    if(user.unpaidCommission < amount) {
        return next (new ErrorHandler(`The amount exceeds your unpaid commission balance. please enter an amount upto ${user.unpaidCommission}`, 403));
    };


    // screenshot allowed formats
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if(!allowedFormats.includes(proof.mimetype)){
        return next (new ErrorHandler("screenshot format not valid format", 400));
    };

// cloudinary response
    const cloudinaryResponse = await cloudinary.uploader.upload(
        proof.tempFilePath,
        {
            folder : "AUCTION_PLATFORM_PAYMENT_PROOFS",
        }
    );
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error(
            "Cloudinary error :", cloudinaryResponse.error || "unknown cloudinary error"
        );
        return next (new ErrorHandler("Failed to upload payment proof image to cloudinary", 500));
    };

     const commissionProof = await PaymentProof.create({
        userId : req.user._id,
        proof : {
            public_id : cloudinaryResponse.public_id,
            url : cloudinaryResponse.secure_url,
        },
        amount,
        comment,
     });
     res.status(201).json({
        success : true,
        message : "Your proof submitted successfully. We will review and respond with in 24 hour",
        commissionProof,
     })
})