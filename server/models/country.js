const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: String,
    start_tax_day: {
      type: String,
      required: true,
    },
    start_tax_month: {
      type: String,
      required: true,
    },
    end_tax_day: {
      type: String,
      required: true,
    },
    end_tax_month: {
      type: String,
      required: true,
    },
    allowed_days: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Country = mongoose.model("Country", countrySchema);

module.exports = Country;
