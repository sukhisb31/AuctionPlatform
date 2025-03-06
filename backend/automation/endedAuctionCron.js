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
          const message = ``;
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
