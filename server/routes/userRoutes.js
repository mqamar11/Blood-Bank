const express = require("express");
const router = express.Router();
const { loginRequired, adminRequired, validate } = require("@base/middleware");
const { updateProfileSchema } = require("@base/validation");
const controller = require("@controllers/UserController");

router
  .route("/users/me")
  .get(loginRequired, controller.getUserProfile)
  .put(loginRequired, validate(updateProfileSchema), controller.updateProfile);

router
  .route("/users/me/profilePicture")
  .delete(loginRequired, controller.deleteProfilePicture);

// ADMIN ROUTES

router.route("/admin/users").get(adminRequired, controller.getAllUser);

router
  .route("/admin/users/changeStatus/:id")
  .patch(adminRequired, controller.toggleAccountStatus);

module.exports = router;
