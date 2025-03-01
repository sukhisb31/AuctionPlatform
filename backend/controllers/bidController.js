import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Auction } from "../models/auctionModel.js";
import { User } from "../models/user.model.js";
import {Bid} from "../models/bidSchema.js"

export const placeBid = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    const auctionItem = await Auction.findById(id);

    //if auction item not found
    if(!auctionItem){
        return next (new ErrorHandler("Auction item not found", 400));
    };
    const {amount} = req.body;
    if(!amount){
        return next (new ErrorHandler("place your bid amount",400 ));
    };
    if(amount <= auctionItem.currentBid){
        return next (new ErrorHandler("Bid amount must be greater than the currentBid", 404));
    };
    if(amount < auctionItem.startingBid){
        return next (new ErrorHandler("Bid amount must be grater than starting bid", 404));
    }

    try {
       const existingBid = await Bid.findOne(
        {"bidder.id" : req.user._id,
        auctionItem : auctionItem._id}
       );
       const existingBidInAuction = auctionItem.bids.find(
        (bid) => bid.userId.toString() == req.user._id.toString()
       );

       if(existingBid || existingBidInAuction){
            existingBidInAuction.amount = amount;
            existingBid.amount = amount;
            await existingBidInAuction.save();
            await existingBid.save();
            auctionItem.currentBid = amount;
       }else{
        const bidderDetail = await User.findById(req.user._id);
        const bid = await Bid.create({
            amount,
            bidder : {
                id : bidderDetail._id,
                userName : bidderDetail.userName,
                profileImage : bidderDetail.profileImage?.url,
            },
            auctionItem : auctionItem._id
        });
        auctionItem.bids.push({
            userId : req.user._id,
            userName : bidderDetail.userName,
            profileImage : bidderDetail.profileImage?.url,
            amount,
        });
            auctionItem.currentBid = amount;

       };
       await auctionItem.save();

       res.status(201).json({
        success : true,
        message : "Bid Placed",
        currentBid : auctionItem.currentBid,
       })
       
    } catch (error) {
        return next (new ErrorHandler(error.message || "Failed to place bid", 500));
    }
})