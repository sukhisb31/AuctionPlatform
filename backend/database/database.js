import mongoose from "mongoose";

export const connection = () =>{
    mongoose.connect(process.env.MONGODB_URI,{
        dbName : "AUCTION_PLATFORM",   
    })
    .then(()=>{
        console.log("connected to database");
        })
        .catch((err)=>{
            console.log(`something error to connected to database : ${err}`);
            
        })
}