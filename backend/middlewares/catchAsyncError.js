export const catchAsyncError = (sukh) =>{
    return(req,res,next) =>{
        Promise.resolve(sukh(req, res, next)).catch(next);
    };
};