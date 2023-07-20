const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const authController = require("../controller/authController");

router
  .get(
    "/me",
    authController.protect,
    userController.getMe,
    userController.getUser
  )
  .get(
    "/",
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  )

  .post("/signup", authController.signup)
  .post("/login", authController.login)
  .get("/logout", authController.logout)
  .post("/forgotPassword", authController.forgotPassword)
  .patch("/resetPassword/:token", authController.resetPassword)
  .patch(
    "/updatePassword",
    authController.protect,
    authController.updatePassword
  )
  .patch("/updateMe", authController.protect, userController.updateMe)
  .delete("/deleteMe", authController.protect, userController.deleteMe)
  .get("/:id", authController.protect, userController.getUser)
  .patch("/:id", authController.protect, userController.updateUser)
  .delete("/:id", authController.protect, userController.deleteUser);

module.exports = router;
