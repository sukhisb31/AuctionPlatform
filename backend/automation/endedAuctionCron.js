import cron from "node-cron";
import {User} from "../models/user.model.js";
import {Auction} from "../models/auctionModel.js";
import {sendEmail} from "../utils/sendEmail.js";
import { calculateCommission } from "../controllers/commissionController.js";
import { Bid } from "../models/bidSchema.js";

export const endedAuctionCron =async()=>{
    cron.schedule("*/1 * * * *", async()=>{
        const now = new Date();
        console.log("Ended auction cron running...", now);
        
        //get all ended auctions
        const endedAuctions = await Auction.find({
            endedTime : {$lt : now},
            commissionCalculated : false,
        });
        //get all users who bid on these auctions
        for (const auction of endedAuctions) {
            try {
                const commissionAmount = await calculateCommission(auction._id);
                auction.commissionCalculated = true;
                //find highest bidder
                const highestBidder = await Bid.findOne({
                    auctionItem : auction._id,
                    amount : auction.currentBid,
                });
                //find auctioneer those placed item for auction
                const auctioneer = await User.findById(auction.createdBy);
                auctioneer.unpaidCommission = commissionAmount;
                if(highestBidder){
                    auction.highestBidder = highestBidder.bidder.id;
                    await auction.save();
                    //find bidder
                    const bidder = await User.findById(highestBidder.bidder.id);
                    //update bidder balance
                    await User.findByIdAndUpdate(
                        bidder._id,
                        {
                            $inc :{
                                moneySpent : highestBidder.amount,
                                auctionsWon : 1,
                            },
                        },
                        {new : true},
                    );
                    //update auctioneer balance
                    await User.findByIdAndUpdate(
                        auctioneer._id,
                        {
                            $inc :{
                                unpaidCommission : commissionAmount,
                            },
                        },
                        {new : true},
                    );
                    //send email to bidder
                    const subject = `Congratulations! You won the auction ${auction.title}`;
                    const message = `Dear ${bidder.userName}, \n\nCongratulations! You have won the auction for ${auction.title}.
                     \n\nBefore proceeding for payment contact your auctioneer via your auctioneer email:${auctioneer.email}
                      \n\nPlease complete your payment using one of the following methods:\n\n1. **Bank Transfer**: \n- Account Name: ${auctioneer.paymentMethods.bankTransfer.bankAccountName} 
                      \n- Account Number: ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} 
                      \n- Bank: ${auctioneer.paymentMethods.bankTransfer.bankName}
                      \n\n2. **Upi**:\n- You can send payment via UPI: ${auctioneer.paymentMethods.ifsc.upi_Id}
                      \n\n3. **PayPal**:\n- Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}
                      \n\n4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% of the total amount upfront before delivery.
                      \n- To pay the 20% upfront, use any of the above methods.
                      \n- The remaining 80% will be paid upon delivery.
                      \n- If you want to see the condition of your auction item then send your email on this: ${auctioneer.email}
                      \n\nPlease ensure your payment is completed by [Payment Due Date]. Once we confirm the payment, the item will be shipped to you.
                      \n\nThank you for participating!\n\nBest regards,
                      \nSukhwinder Singh Auction Team`;
                      //check error in sending email
                      console.log("Sending email to highest bidder...", bidder.email);
                      //send email to bidder
                      sendEmail({email : bidder.email, subject, message});
                      console.log("Email sent to highest bidder successfully");
                      
                    }
                    else{
                        await auction.save();
                    }
            } catch (error) {
                return next(console.error(error || "Something went wrong while calculating commission"));
            }
            
        }
    })
}