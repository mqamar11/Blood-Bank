const mongoose = require("mongoose");

const configurationsSchema = new mongoose.Schema(
  {
    account_trial_days: Number,
    subscription_on_register: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Configurations = mongoose.model("configurations", configurationsSchema);

module.exports = Configurations;
