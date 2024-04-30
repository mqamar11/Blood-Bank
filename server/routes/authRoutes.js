const express = require("express");
const router = express.Router();
const { loginRequired, validate } = require("@base/middleware");
const {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} = require("@base/validation");
const controller = require("@controllers/AuthController");

router.route("/register").post(validate(registerSchema), controller.register);

router.route("/login").post(validate(loginSchema), controller.login);

router
  .route("/forgotPassword")
  .post(validate(forgetPasswordSchema), controller.forgetPassword);

router
  .route("/resetPassword")
  .put(validate(resetPasswordSchema), controller.resetPassword);

router.route("/logout").post(loginRequired, controller.logout);

module.exports = router;
