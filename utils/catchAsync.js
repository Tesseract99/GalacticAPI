const AppError = require("./appError");

//catching errors
const catchAsync = (controller) => {
  return (req, res, next) => {
    controller(req, res, next).catch((err) => {
      // const obj = new AppError(err);
      // next(obj);
      next(err);
    });
  };
};

module.exports = catchAsync;
