const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");
const bookingController = require("../controller/bookingsController");

router.use(authController.protect);

router
  .get(
    "/checkout-session/:tourId",
    authController.protect,
    bookingController.createCheckoutSession
  )
  .post(
    "/payment-success/",
    authController.protect,
    bookingController.paymentSuccess
  );

module.exports = router;
