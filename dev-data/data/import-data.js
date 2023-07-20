/*
USAGE:

>>node import-data.js create reviews.json Review

*/

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");
dotenv.config({ path: `${__dirname}/../../config.env` });
// console.log(`DIRNAME: ${__dirname}`);
//mongoose
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections);
    console.log("db connection successful");
  })
  .catch((err) => {
    console.error(err);
  });

const filePath = `${__dirname}/${process.argv[3]}`;
const modelArg = process.argv[4];
const data = JSON.parse(fs.readFileSync(filePath));
let Model;
let options = {};
if (modelArg === "User") {
  Model = User;
  options = {
    validateBeforeSave: false,
  };
} else if (modelArg === "Tour") Model = Tour;
else if (modelArg === "Review") Model = Review;

//create
const createDocs = async () => {
  try {
    await Model.create(data, options);
    console.log(`create all ${modelArg}s`);
    process.exit();
  } catch (error) {
    console.log("ERROR", error);
  }
};

//delete
const deleteDocs = async () => {
  try {
    await Model.deleteMany({});
    console.log(`deleted all ${modelArg}s`);
    process.exit();
  } catch (error) {
    console.log("Error: ", error);
  }
};

// console.log(process.argv[2] === 'delete')
if (process.argv[2] === "delete") {
  deleteDocs();
} else if (process.argv[2] === "create") {
  createDocs();
}
