const express = require("express");
const router = express.Router();
const { adminRequired, validate } = require("@base/middleware");
const { countriesSchema } = require("@base/validation");
const controller = require("@controllers/CountryController");

router.route("/countries").get(controller.getAll);

// ADMIN ROUTES

router
  .route("/admin/countries")
  .get(adminRequired, controller.getAll)
  .post(adminRequired, validate(countriesSchema), controller.create);

router
  .route("/admin/countries/:id")
  .delete(adminRequired, controller.delete)
  .put(adminRequired, validate(countriesSchema), controller.update)
  .get(adminRequired, controller.getById);

module.exports = router;
