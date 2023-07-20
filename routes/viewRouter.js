const express = require("express");
const viewsController = require("../controller/viewController");
const authController = require("../controller/authController");

const router = express.Router();

// use this middleware for all view related routes
// router.use(authController.isLoggedIn);

router.get("/", viewsController.getOverview);
router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTour);
router.get("/login", authController.isLoggedIn, viewsController.getLoginForm);
router.get("/me", authController.isLoggedIn, viewsController.getAccount);

router.post(
  "/submit-user-data",
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
