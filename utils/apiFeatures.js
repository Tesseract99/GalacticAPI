class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  //methods
  advancedFiltering() {
    //build the query
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((key) => delete queryObj[key]);

    console.log(this.queryString);

    //advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (msg) => `$${msg}`
    );

    //query
    this.query.find(JSON.parse(queryString)); //we can keep chaining methods to 'query'

    return this;
  }

  //sorting
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  //fields selection
  fieldSelection() {
    if (this.queryString.fields) {
      const include = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(include);
    } else {
      this.query.select("-__v -createdAt");
    }
    return this;
  }

  //pagination
  pagination() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
