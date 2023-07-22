const Razorpay = require("razorpay");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const razorpayUtils = require("razorpay/dist/utils/razorpay-utils");

const instance = new Razorpay({
  key_id: process.env.RZPAY_KEYID,
  key_secret: process.env.RZPAY_KEYSECRET,
});

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  const options = {
    amount: tour.price * 100, // amount in the smallest currency unit (amount X 100)
    currency: "INR",
  };

  const order = await instance.orders.create(options);

  res.status(200).json({
    status: "success",
    order,
  });
});

exports.paymentSuccess = async (req, res, next) => {
  const result = await razorpayUtils.validatePaymentVerification(
    {
      order_id: req.body.razorpay_order_id,
      payment_id: req.body.razorpay_payment_id,
    },
    req.body.razorpay_signature,

    process.env.RZPAY_KEYSECRET
  );

  if (result) {
    res.status(200).json({
      status: "success",
      message: "Thank You For Touring with us!",
    });
  } else {
    res.status(402).json({
      status: "fail",
      message: "Payment Failed. Please try again",
    });
  }
};
