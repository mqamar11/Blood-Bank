const express = require("express");
const router = express.Router();
const { adminRequired, validate } = require("@base/middleware");
const { subscriptionSchema } = require("@base/validation");
const controller = require("@controllers/SubscriptionController");

router
  .route("/admin/subscriptions")
  .get(adminRequired, controller.getAll)
  .post(adminRequired, validate(subscriptionSchema), controller.create);

router
  .route("/admin/subscriptions/:id")
  .get(adminRequired, controller.getById)
  .delete(adminRequired, controller.delete)
  .put(adminRequired, validate(subscriptionSchema), controller.update);

module.exports = router;
