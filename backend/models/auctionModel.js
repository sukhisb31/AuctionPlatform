import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    startingBid: {
        type: Number,
        required: true,
    },
    condition: {
        type: String,
        enum: ["New", "Used"],
    },
    category: String,
    currentBid: {
        type: Number,
        default: 0,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    image: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bids: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Bid",
            },
            userName: String,
            amount: Number,
            profileImage: String,
        },
    ],
    commissionCalculated: {
        type: Boolean,
        default: 0,
    },
    highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Auction = mongoose.model("Auction", auctionSchema);