const mongoose = require("mongoose");
const { DURATION } = require("@constants/stripe");

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
      type: Number,
      required: true,
    },
    best_value: {
      type: Boolean,
      default: false,
    },
    sourceData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },
    deleted: {
      type: Boolean,
      default: false,
      select: false,
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
