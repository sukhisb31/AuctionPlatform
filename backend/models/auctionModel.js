

import mongoose from "mongoose";

const auctionSchema = new mongoose.model({
    title: {
        type: String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
    startBid : {
        type: String,
        required : true,
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
    startTime : {
        type: String,
    },
    endTime : {
        type : String,
    },
    image :{
        public_Id : {
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
    },
    bid: [
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
    highestBid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },
});


export const Auction = mongoose.model("Auction", auctionSchema);
