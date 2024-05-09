const express = require("express");
const router = express.Router();
const { adminRequired, validate } = require("@base/middleware");
const { configurationsSchema } = require("@base/validation");
const controller = require("@controllers/ConfigurationController");

router.route("/configurations").get(controller.get);

// ADMIN ROUTES

router
  .route("/admin/configurations")
  .get(adminRequired, controller.get)
  .post(adminRequired, validate(configurationsSchema), controller.create)
  .put(adminRequired, validate(configurationsSchema), controller.update);

module.exports = router;
