const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError("Invalid ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newDocument,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const updatedDocument = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        tour: updatedDocument,
      },
    });
  });

exports.getOne = (Model, populateParams) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id).populate(
      populateParams
    );
    if (!document) {
      return next(new AppError("Invalid ID", 404));
    }

    res.status(200).json({
      status: "success",

      data: document,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //set up the query
    const features = new APIFeatures(
      Model.find(req.initialFilter || {}), //reqs from review has this option
      req.query
    )
      .advancedFiltering()
      .sorting()
      .fieldSelection()
      .pagination();

    //execute the query -- awaiting the query executes it under the hood
    // await features.query.getUserDataById();
    const document = await features.query;

    res.status(200).json({
      status: "success",
      length: document.length,
      data: document,
    });
  });
