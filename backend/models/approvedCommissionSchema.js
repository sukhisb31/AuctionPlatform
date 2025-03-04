import mongoose from "mongoose";

const approvedCommissionSchema = new mongoose.Schema ({
    amount : Number,
    user : {
        type : mongoose.Schema.Types.ObjectId,
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },
});

export const Commission = mongoose.model("Commission", approvedCommissionSchema);