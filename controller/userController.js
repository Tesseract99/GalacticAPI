const fs = require("fs");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const handlerFactory = require("./handlerFactory");

const filterObj = (obj, keyFilter) => {
  const filteredObj = {};

  for (const key of Object.keys(obj)) {
    if (keyFilter.includes(key)) {
      filteredObj[key] = obj[key];
    }
  }

  return filteredObj;
};

exports.getAllUsers = handlerFactory.getAll(User);

exports.getUser = handlerFactory.getOne(User);

//Not for updating Passwords
exports.updateUser = handlerFactory.updateOne(User);

exports.deleteUser = handlerFactory.deleteOne(User);

/* Individual User Operations */

exports.updateMe = catchAsync(async (req, res, next) => {
  //if the body has password, confirmPassword - throw error
  const updatedInfo = req.body;
  if ("password" in updatedInfo || "confirmPassword" in updatedInfo) {
    return next(new AppError("Cannot update password in this endpoint", 405));
  }

  //extract only name and email from the body
  const filteredUpdatedInfo = filterObj(updatedInfo, ["name", "email"]);
  //find by id and update only the name and email
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    filteredUpdatedInfo,
    {
      new: true,
    }
  );
  //send updated user as response
  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});

/*
we dont actually delete the user. we just set the 'active'
property to false.
*/
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user;
  next();
});
