const express = require("express");
const router = express.Router();
const { loginRequired, adminRequired, validate } = require("@base/middleware");
const {
  updateProfileSchema,
  updatePasswordSchema,
  attachPaymentMethodSchema,
} = require("@base/validation");
const controller = require("@controllers/UserController");

router
  .route("/users/me")
  .get(loginRequired, controller.getUserProfile)
  .put(loginRequired, validate(updateProfileSchema), controller.updateProfile);

router
  .route("/users/me/profilePicture")
  .delete(loginRequired, controller.deleteProfilePicture);

router
  .route("/users/me/updatePassword")
  .patch(
    loginRequired,
    validate(updatePasswordSchema),
    controller.updatePassword
  );

router
  .route("/users/me/attachPaymentMethod")
  .post(
    loginRequired,
    validate(attachPaymentMethodSchema),
    controller.attachPaymentMethod
  );

// ADMIN ROUTES

router.route("/admin/users").get(adminRequired, controller.getAll);

router
  .route("/admin/users/changeStatus/:id")
  .patch(adminRequired, controller.toggleAccountStatus);

module.exports = router;
