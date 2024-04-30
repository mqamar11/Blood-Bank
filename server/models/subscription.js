const mongoose = require("mongoose");
const { DURATION } = require("@constants");

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "$",
    },
    description: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    duration: {
      type: String,
      enum: [DURATION],
      required: true,
    },
    trial_period: {
      type: String,
      required: true,
    },
    best_value: {
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

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
