const express = require("express");

const router = express.Router();
const tourController = require("../controller/tourController");
const authController = require("../controller/authController");
const reviewRouter = require("./reviewRoutes");

router.use("/:tourId/reviews", reviewRouter);

router
  .get("/", tourController.getAllTours)
  .get("/top-5-cheap", tourController.aliasTopTours, tourController.getAllTours)
  .get(
    "/tour-stats",
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getTourStats
  )
  .get(
    "/monthly-plan/:year",
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  )
  .get("/:id", tourController.getTour)
  .post(
    "/",
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  )
  .patch(
    "/:id",
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    "/:id",
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
