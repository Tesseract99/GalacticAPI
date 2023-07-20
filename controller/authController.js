const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const mailSenderFn = require("../utils/email");
const crypto = require("crypto");
const { use } = require("../app");

const createJwtToken = (_id) => {
  const token = jwt.sign({ _id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const sendJwtToken = (statusCode, user, res) => {
  const token = createJwtToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  user.password = undefined;
  cookieOptions.secure = process.env.NODE_ENV === "production"; //make it secure only in production
  res.locals.user = user;
  res
    .status(statusCode)
    .cookie("jwt", token, cookieOptions)
    .json({
      status: "success",
      data: {
        user: user,
      },
      token,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    photo: req.body.photo,
    role: req.body.role,
  };
  const newUser = await User.create(userData);

  // const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET_KEY, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });
  // const token = createJwtToken(newUser._id);
  // res.status(201).json({
  //   status: "success",
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
  sendJwtToken(201, newUser, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password have been provided
  if (!email || !password) {
    return next(new AppError("please provide email and password", 401));
  }

  //check if the email exists in the DB and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  sendJwtToken(200, user, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  // console.log("logout controller");
  res
    .status(200)
    .cookie("jwt", "loggedoutval", {
      expiresIn: new Date(Date.now() + 10 * 1000),
    })
    .json({
      status: "success",
    });
});

/*Validate the user from the token received*/
exports.protect = catchAsync(async (req, res, next) => {
  //check if header has token
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")) &&
    !req.cookies.jwt
  ) {
    return next(new AppError("Token Missing from Header", 401));
  }

  if (req?.cookies?.jwt === "loggedoutval") return next();
  const token = req.headers?.authorization?.split(" ")[1] || req.cookies?.jwt;
  //check if token in valid
  // console.log("TOKEN", token);
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );
  // console.log(decoded);

  //check if the user still exits (might have been deleted after token was issued)
  const freshUser = await User.findOne({ _id: decoded._id });
  if (!freshUser) {
    return next(new AppError("User does't exits", 401));
  }
  //check if the password was changed after token was issued
  if (freshUser.isPasswordChangedAfterToken(decoded.iat))
    return next(new AppError("Password changed. Please login again", 401));

  req.user = freshUser;
  res.locals.user = freshUser;
  next(); //permission granted
});

/** Check if the user is logged in for every request */

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      if (req.cookies.jwt === "loggedoutval")
        // return next(new AppError("Please Login to perform this action", 401));
        return next();
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET_KEY
      );

      // 2) check if user exists in DB
      const freshUser = await User.findOne({ _id: decoded._id });
      if (!freshUser) return next();

      // 3) check if the user changes the password after token was issued
      if (freshUser.isPasswordChangedAfterToken(decoded.iat)) return next();
      // console.log("isloggedIn: password not changed");
      // All checks passed! There is a local user

      res.locals.user = freshUser;
      return next();
    } catch (error) {
      console.log("error", error);
      return next();
    }
  } else {
    next();
  }
};

/*restricTo is not the middleware, it is a wrapper fn for accessing the 'roles' argument
It then returns an actual middleware
this setup was needed because, actual middlewares cannot take extra args, so could not take the role arg
directly */
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "User does not have permission to perform this operation",
          403
        )
      );
    }
    //permission granted
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //check if the email exists
  const user = await User.findOne({ email: req.body.email });

  //if not, send error
  if (!user) {
    return next(new AppError("The User does not exist", 404));
  }

  //get the reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to user's email
  mailSenderFn({
    senderName: "Natours",
    senderEmail: "Natours@ResetPassword.com",
    receiverMailList: [`${user.email}`],
    subject: `Bhaiyon Aur Bheno. Ye lo ${resetToken}`,
    body: `Gym Body`,
  });
  //send response
  res.status(200).json({
    status: "success",
    data: resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //convert reset token to hash

  const UserResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(req.params.token, UserResetToken);
  //query DB for user with this token which has not expired
  const user = await User.findOne({
    passwordResetToken: UserResetToken,
    passwordResetExpiry: { $gt: Date.now() },
  });
  //if user is not there, send error
  if (!user)
    return next(new AppError("Invalid Token or Token has expired", 404));
  //if user is there, reset password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  //send JWT token back as response
  // const newJwtToken = createJwtToken(user._id);
  // res.status(200).json({
  //   status: "Success",
  //   token: newJwtToken,
  // });
  sendJwtToken(200, user, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get the user from DB
  const user = await User.findOne({ email: req.user.email }).select(
    "+password"
  );
  //const user = await User.findOne({ email }).select("+password");
  //verify current password
  if (
    !user ||
    !(await user.verifyPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError("Invalid email or password", 401));
  }

  //update the password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.newConfirmPassword;
  await user.save();
  //send JWT token as response
  // const newJwtToken = createJwtToken(user._id);
  // res.status(200).json({
  //   status: "Success",
  //   token: newJwtToken,
  // });
  sendJwtToken(200, user, res);
});
