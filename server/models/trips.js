const mongoose = require("mongoose");

const { TRIP_STATUSES } = require("@constants");
const { PENDING } = TRIP_STATUSES;

const tripsSchema = new mongoose.Schema(
  {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "Country is required"],
      autopopulate: { select: "name" },
    },
    entryDate: {
      type: Date,
      required: true,
    },
    exitDate: {
      type: Date,
      required: true,
    },
    images: [String],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: [TRIP_STATUSES],
      default: PENDING,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tripsSchema.plugin(require("mongoose-autopopulate"));

const Trips = mongoose.model("trips", tripsSchema);
module.exports = Trips;
