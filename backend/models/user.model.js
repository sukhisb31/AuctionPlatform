import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    userName : {
        type: String,
        required : true,
        minLength : [3, "userName must contain at least 3 character or more"],
        maxLength :[40, "username not exceed 40 character"],
    },
    password :{
        type : String,
        selected : false,
        minLength : [6, "password strength is 6 or more than 6 character"],
    },
    email: {
        type: String,
        required : true,
    },
    address: String,
    phone : {
        type :String,
        minLength :[10, "Enter valid phone number"],
        maxLength:[10, "enter correct phone number"],
    },
    profileImage:{
        public_id:{
            type: String,
            required : true,
        },
        url :{
            type : String,
            required :true,
        },
    },
    paymentMethods :{
        bankTransfer : {
            bankAccountNumber : String,
            bankAccountName : String,
            bankName : String,
        },
        ifsc :{
            upi_Id : String,
        },
        paypal :{
            paypalEmail: String,
        },
    },
    role: {
        type: String,
        enum : ["Auctioneer", "Bidder", "Super Admin"],
    },
    unpaidCommission : {
        type: Number,
        default : 0,
    },
    auctionWOn : {
        type : Number,
        default : 0,
    },
    moneySpent : {
        type: Number,
        default : 0,
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },

});

// password converted into hash
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
})
// compare password or confirm password
userSchema.methods.comparePassword = async function (enterPassword){
    return await bcrypt.compare(enterPassword, this.password);
}

//generate jwt web token
userSchema.methods.generateJsonWebToken = function(){
    return jwt.sign(
        {id : this._id},
        process.env.JWT_SECRET_KEY,
        {expiresIn : process.env.JWT_EXPIRE_KEY}
    )
}

export const User = mongoose.model("User", userSchema);