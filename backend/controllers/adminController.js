import mongoose from "mongoose";
import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Auction } from "../models/auctionModel.js";
import { User } from "../models/user.model.js";
import {Commission} from "../models/approvedCommissionSchema.js";
import { PaymentProof } from "../models/commissionProofSchema.js";

export const deleteAuctionItem = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid id format", 400));
  }

  const auctionItem = await Auction.findById(id);
  if (!auctionItem) {
    return next(new ErrorHandler("Auction Item is not found", 404));
  }
  await auctionItem.deleteOne();
  res.status(200).json({
    success: true,
    message: "Auction item deleted successfully",
  });
});

//make a get all payment proofs function

export const getAllPaymentProofs = catchAsyncError(async (req, res, next) => {
  let paymentProofs = await PaymentProof.find();
  res.status(200).json({
    success: true,
    paymentProofs,
  });
});

// after get all payment proof than update function of proofs
// first make get payment proof details
export const getPaymentProofDetail = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const paymentProofDetail = await PaymentProof.findById(id);
  res.status(200).json({
    success: true,
    paymentProofDetail,
  });
});
// now update proof
export const updateProofStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { amount, status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid id format", 400));
  }

  let proof = await PaymentProof.findById(id);
  if (!proof) {
    return next(new ErrorHandler("Payment proof not found", 404));
  }
  proof = await PaymentProof.findByIdAndUpdate(
    id,
    { status, amount },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    message: "Payment proof and Status updated ",
    proof,
  });
});

//Delete payment proofs
export const deletePaymentProof = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const proof = await PaymentProof.findById(id);

  if (!proof) {
    return next(new ErrorHandler("Payment proof not found", 404));
  }
  await proof.deleteOne();
  res.status(200).json({
    success: true,
    message: "Payment proof deleted",
  });
});

//first fetch all users those pay commissions after that create group according to months and years
export const fetchAllUsers = catchAsyncError(async (req, res, next) => {
// Aggregate users by month, year, and role
const users = await User.aggregate([
    {
        $group: {
            _id: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
                role: "$role",
            },
            count: { $sum: 1 },
        },
    },
    {
        $project: {
            month: "$_id.month",
            year: "$_id.year",
            role: "$_id.role",
            count: 1,
            _id: 0,
        },
    },
    {
        $sort: { year: 1, month: 1 },
    },
]);
//get Bidder and Auctioneer role in this function
  const bidders = users.filter((user) => user.role === "Bidder");
  const auctioneers = users.filter((user) => user.role === "Auctioneer");
// make an array and store data in array according to month and year
  const transformDataToMonthlyArray = (data, totalMonths = 12) =>{
    const result = Array(totalMonths).fill(0);
    data.forEach( item => {
        result [ item.month - 1] = item.count
    });
    return result;
  };
//set array in months and year
  const bidderArray = transformDataToMonthlyArray(bidders);
  const auctioneerArray = transformDataToMonthlyArray(auctioneers);

  res.status(200).json({
    success : true,
    bidderArray,
    auctioneerArray,
  })

});

//calculate monthly revenue according to month
export const monthlyRevenue = catchAsyncError(async(req,res,next)=>{
    const payments = await Commission.aggregate([
        {
            $group : {
                _id : {
                    month : {$month : "$createdAt"},
                    year : {$year : "$createdAt"},
                },
                totalAmount : {$sum : "$amount"},
            },
        },
        {
            $sort : {
                "_id.year" : 1,
                "_id.month" : 1,
            },
        },
    ]);

    const transformDataToMonthlyArray = (payments, totalMonths = 12) =>{
        const result = Array(totalMonths).fill(0);
        payments.forEach((payment) => {
            result [payment._id.month - 1] = payment.totalAmount;
        });
        return result;
    };
    const totalMonthlyRevenue = transformDataToMonthlyArray(payments);
    res.status(200).json({
        success : true,
        totalMonthlyRevenue,
    })
})
