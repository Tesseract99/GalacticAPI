const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingsRouter = require("./routes/bookingsRoutes");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const app = express();
const AppError = require("./utils/appError");
const errorController = require("./controller/errorController");
const path = require("path");
const viewRouter = require("./routes/viewRouter");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const limiter = rateLimit({
  //max 100 requests per hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  standardHeaders: true,
});

//middleware
if (process.env.NODE_ENV === "development");

app.use(helmet()); //security middleware

//sanitize noSQL injections
app.use(mongoSanitize());
//sanitize cross site scripting
app.use(xss());

//parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "rating",
      "ratingsQuantity",
      "maxGroupSize",
      "price",
    ],
  })
);

// app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

//views
// app.get("/", (req, res) => {
//   res.status(200).render("base", {
//     quote:
//       "You're born. You have a set of feelings, emotions, thoughts. You Die",
//   });
// });

// app.get("/overview", (req, res) => {
//   res.status(200).render("overview", {
//     title: "All Tours",
//   });
// });

//API
app.use("/", viewRouter);
app.use("/api", limiter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingsRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`Oops. ${req.originalUrl} not found`, 404)); //a next with an arg will call the error middleware
});

//error handler
app.use(errorController.globalErrorHandler);

module.exports = app;
