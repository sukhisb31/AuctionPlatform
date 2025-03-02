import mongoose from "mongoose";

export const paymentProofSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    proof : {
        public_id : {
            type : String,
            required : true,
        },
        url : {
            type : String,
            required : true,
        },
    },
    uploadedAt : {
        type: Date,
        default : Date.now,
    },
    status : {
        type : String,
        default : "Pending",
        enum : ["Pending", "Approved", "Rejected", "Settled"],
    },
    amount :{
        type: Number,
        required : true,
    },
    comment : String,
});

export const PaymentProof = mongoose.model("PaymentProof", paymentProofSchema);