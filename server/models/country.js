const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: String,
    start_tax_day: {
      type: Number,
      required: true,
    },
    start_tax_month: {
      type: Number,
      required: true,
    },
    end_tax_day: {
      type: Number,
      required: true,
    },
    end_tax_month: {
      type: Number,
      required: true,
    },
    allowed_days: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
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
