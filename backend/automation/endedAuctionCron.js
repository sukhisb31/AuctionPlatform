import cron from "node-cron";
import { Auction } from "../models/auctionModel.js";
import { User } from "../models/user.model.js";
import { Bid } from "../models/bidSchema.js";
import { calculateCommission } from "../controllers/commissionController.js";
import { sendEmail } from "../utils/sendEmail.js";

export const endAuctionCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    const now = new Date();
    // console.log("ended cron running...");
    // find ended auctions
    const endedAuctions = await Auction.find({
      endTime: { $lt: now },
      commissionCalculated: false,
    });
    // use for of loop
    for (const auction of endedAuctions) {
      try {
        const commissionAmount = await calculateCommission(auction._id);
        auction.commissionCalculated = true;
        // find highest bidder
        const highestBidder = await Bid.findOne({
          auctionItem: auction._id,
          amount: auction._id,
        });
        // find auctioneer whose create bid
        const auctioneer = await User.findById(auction.createdBy);
        auctioneer.unpaidCommission = commissionAmount;
        if (highestBidder) {
          auction.highestBidder = highestBidder.bidder.id;
          await auction.save();
          // find bidder whose bid in participate in auction
          const bidder = await User.findById(highestBidder.bidder.id);
          await User.findByIdAndUpdate(
            bidder._id,
            {
              $inc: {
                moneySpent: highestBidder.amount,
                auctionsWon: 1,
              },
            },
            { new: true }
          );
          // find auctioneer and update _id
          await User.findByIdAndUpdate(
            auctioneer._id,
            {
              $inc: {
                unpaidCommission: commissionAmount,
              },
            },
            { new: true }
          );
          const subject = `congratulations! You won the auction for ${auction.title}`;
          const message = `Dear ${bidder.userName}, \n\n Congratulations! You have won the auction for ${auction.title}. \n\n  
          **Bank Transfer** : \n- Account Name : ${auctioneer.paymentMethods.bankTransfer.bankAccountName} \n-
          Bank : ${auctioneer.paymentMethods.bankTransfer.bankName}, \n\n2 
          **UPI-ID**: \n- You can send payment via Upi-ID : ${auctioneer.paymentMethods.upi_id.bankAccountNumber} \n\n3.
          **PayPal**: \n- Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}, \n\n4. 
          **Cash On Delivery (COD)**:\n-  If you prefer COD, You must pay 20% of the total amount upfront before delivery.\n-
          To pay the 20% upfront, use any above methods. \n
          If you want to see the condition of your auction item then send you email on this : ${auctioneer.email}, \n\n
          Please ensure your payment is completed by [payment due date]. 
          Once we confirm the payment, then item will be shipped to you. \n\n 
          Thank you for participating! \n\n
          Best Regards, \n 
          Sukhwinder Singh Auction Team`;
          sendEmail({ email: bidder.email, subject, message });
        } else {
          await auction.save();
        }
      } catch (error) {
        return next(console.error(error || "some error in ended auction cron"));
      }
    }
  });
};
