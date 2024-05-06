const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { USER_ROLES } = require("@constants");
const { USER } = USER_ROLES;
const config = require("@config");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxLength: [30, "Your name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      trim: true,
      validate: [validator.isEmail, "Please enter valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },
    otp_code: {
      type: String,
      required: [false],
      maxLength: [6, "Your otp code cannot exceed 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      // required: [true],
      trim: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      // required: [true, "Please enter your country"],
      autopopulate: { select: "name" },
    },
    profile_picture: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: [USER_ROLES],
      default: USER,
    },
    status: {
      type: Boolean,
      default: true,
    },
    paymentSource: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
});

//Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, config.jwt.secret, {
    expiresIn: config.jwt.expiryTime,
  });
};
userSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("User", userSchema);
