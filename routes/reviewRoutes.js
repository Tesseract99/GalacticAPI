const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");
router
  .get(
    "/",
    authController.protect,
    reviewController.filterReviewByTourId,
    reviewController.getAllReviews
  )
  .get("/:id", authController.protect, reviewController.getReview)
  .post(
    "/",
    authController.protect,
    authController.restrictTo("user"), //admins, guides can't post reviews
    reviewController.setTourUserIds,
    reviewController.createReview
  )
  .delete(
    "/:id",
    authController.protect,
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  )
  .patch(
    "/:id",
    authController.protect,
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  );

module.exports = router;
