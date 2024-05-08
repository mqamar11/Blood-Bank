const express = require("express");
const router = express.Router();
const controller = require("@controllers/StripeController");

router
  .route("/stripe/webhook")
  .post(express.raw({ type: "application/json" }), controller.webhook);

module.exports = router;
