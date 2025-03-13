

import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    title: {
        type: String,
        required : true,
    },
    description : {
        type : String,
    },
    startingBid : {
        type: Number,
    },
    condition : {
        type : String,
        enum :["New", "Used"],
    },
    category : String,
    currentBid :{
        type : Number,
        default : 0,
    },
    startTime :  String,
    endTime : String,
    image :{
        public_id : {
            type : String,
            required : true,
        },
        url : {
            type : String,
            required : true,
        },
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    currentBid:{
        type : Number,
        default:0,
    },
    bids: [
        {
            userId :{
                type: mongoose.Schema.Types.ObjectId,
                ref:"Bid",
            },
            userName : String,
            amount : Number,
            profileImage : String,
        },
    ],
    commissionCalculated : {
        type : Boolean,
        default : false,
    },
    highestBidder : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },
});


export const Auction = mongoose.model("Auction", auctionSchema);
