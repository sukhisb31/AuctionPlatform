import cron from "node-cron";
import {User} from "../models/user.model.js";
import {Auction} from "../models/auctionModel.js";
import { calculateCommission } from "../controllers/commissionController.js";
import {sendEmail} from "../utils/sendEmail.js";
import { Bid } from "../models/bidSchema.js";

export const endedAuctionCron = async() => {
  cron.schedule("* * * * *", async() =>{
    const now = new Date();
    console.log("Checking for ended auctions... for", now);
    //find ended auctions
    const endedAuctions = await Auction.find({
      endDate : {$lt : now},
      commissionCalculated : false,
    });
    // use for loop to process each auction
    for (const auction of endedAuctions) {
      try {
        const commissionAmount = await calculateCommission(auction._id);
        auction.commissionCalculated = true;
        // find highest bidder
        const highestBidder = await Bid.findOne({
          auctionItem : auction._id,
          amount : auction.currentBid,
        });
        const auctioneer = await User.findById(auction.createdBy);
        auctioneer.unpaidCommission = commissionAmount;
        if(highestBidder){
          auction.highestBidder = highestBidder.bidder.id;
          await auction.save();
          // find bidder 
          const bidder = await User.findById(highestBidder.bidder.id);
          // update bidder balance
          await User.findByIdAndUpdate(
            bidder._id,
            {
              $inc : {
                moneySpent : highestBidder.amount,
                auctionWon : 1,
              },
            },
            {new : true},
          );
          // update auctioneer commission
          await User.findByIdAndUpdate(
            auctioneer._id,
            {
              $inc :{
                unpaidCommission : commissionAmount,
              },
            },
            {new : true},
          );
          // send mail to bidder
          const subject = `Congratulations! You won the auction ${auction.title}`;
          const message = `Dear ${bidder.userName}, \n\n Congratulations! You have successfully won the auction ${auction.title}. \n\n Before proceeding for payment contact your auctioneer via your auctioneer email: ${auctioneer.email} \n\n please complete your payment using one of the following methods: \n\n **Bank Transfer**: \n- Account Name: ${auctioneer.paymentMethods.bankTransfer.bankAccountName} \n Account Number : ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} \n Bank :${auctioneer.paymentMethods.bankTransfer.bankName} \n\n2. **UPI_ID** : you can send payment via Upi Id also : ${auctioneer.paymentMethods.ifsc.upi_Id} \n\n\n3. **Paypal**: \n- Send payment to paypal also : ${auctioneer.paymentMethods.paypal.paypalEmail} \n\n4. **Cash On Delivery**:\n- If you prefer COD, you must pay 20% of the total amount upfront before delivery.\n To pay the 20% upfront, use any of the above methods. \n- The remaining 80% will be paid upon the delivery. \n- If you want to see the condition of your auction item then send your email on this : ${auctioneer.email}\n\n Please ensure your payment is completed by [Payment due date]. Once we confirm the payment, the item will be shipped to you. \n\n\n Thank you for participating! \n\n\n Best Regards, \n\n Sukhwinder Singh Auction Team `;
          console.log("Sending email to highest bidder");
          
          sendEmail({email: bidder.email, subject, message});
          console.log("Successfully sent email to bidder");
          
        }
      } catch (error) {
        return next( console.error(error || "some error occurred in ended auction cron"))
        
      }
    }
    
  })
}






