import mongoose from "mongoose";

export const paymentProofSchema = new mongoose.Schema({
    userId : {
        type : String,
        required : true,
        ref : "User",
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
        default : pending,
        enum : ["Pending", "Approved", "Rejected", "Settled"],
    },
    amount :{
        type: Number,
        required : true,
    },
    comment : String,
});

export const PaymentProof = mongoose.model("PaymentProof", paymentProofSchema);