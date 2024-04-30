const express = require("express");
const router = express.Router();
const { loginRequired, adminRequired, validate } = require("@base/middleware");
const { tripsSchema } = require("@base/validation");
const controller = require("@controllers/TripController");

router
  .route("/trips")
  .get(loginRequired, controller.getAll)
  .post(loginRequired, validate(tripsSchema), controller.create);

router
  .route("/trips/:id")
  .get(loginRequired, controller.getById)
  .put(loginRequired, validate(tripsSchema), controller.update)
  .delete(loginRequired, controller.delete);

// ADMIN ROUTES

router.route("/admin/trips").get(adminRequired, controller.getAll);

module.exports = router;
