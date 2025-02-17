import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./error.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async(req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return next (new ErrorHandler("User Are not Authenticated"));
    }
    // jwt verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    next();
}) 