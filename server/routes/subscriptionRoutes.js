const express = require("express");
const router = express.Router();
const { adminRequired, loginRequired, validate } = require("@base/middleware");
const {
  subscriptionSchema,
  cancelSubscriptionSchema,
} = require("@base/validation");
const controller = require("@controllers/SubscriptionController");

router.route("/subscriptions").get(loginRequired, controller.getAll);

router
  .route("/subscriptions/purchase/:id")
  .post(loginRequired, controller.purchase);

router
  .route("/subscriptions/cancel/:id")
  .delete(loginRequired, validate(cancelSubscriptionSchema), controller.cancel);

// ADMIN ROUTES

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
