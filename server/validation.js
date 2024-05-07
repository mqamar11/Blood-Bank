const Joi = require("joi");
const config = require("@config");
const { profile } = require("./config/index");

const { passwordPolicy } = config;

const validate = (data, schema, opts = {}) => {
  if (!opts) opts = {};
  const { error, value } = schema.validate(data, {
    abortEarly: true,
    convert: true,
    ...opts,
  });

  if (error)
    return { error: error.details.map((detail) => detail.message), value };

  return { error, value };
};

const registerSchema = {
  name: Joi.string().label("Name").required(),
  email: Joi.string().label("Email").required(),
  password: Joi.string().label("Password").required(),
  phone: Joi.string().label("phone").optional(),
};

const loginSchema = {
  email: Joi.string().label("Email").required(),
  password: Joi.string().label("Password").required(),
};

const forgetPasswordSchema = {
  email: Joi.string().label("email").required(),
};

const resetPasswordSchema = {
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "co"] } })
    .label("Email")
    .required(),
  new_password: Joi.string().label("new_password").required(),
  confirm_password: Joi.string().label("confirm_password").required(),
  otp_code: Joi.string().label("otp_code").required(),
};

const updateProfileSchema = {
  name: Joi.string().label("Name").optional().allow(""),
  phone: Joi.number().label("Phone").optional().allow(""),
  country: Joi.number().label("Country").optional().allow(""),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp(passwordPolicy.rule))
    .label("Password")
    .messages({
      "string.min": passwordPolicy.min,
      "string.pattern.base": passwordPolicy.message,
    })
    .optional()
    .allow(""),
};

const countriesSchema = {
  name: Joi.string().label("Name").required(),
  code: Joi.string().label("Code"),
  start_tax_day: Joi.string().label("start_tax_day").required(),
  end_tax_day: Joi.string().label("end_tax_day").required(),
  start_tax_month: Joi.string().label("start_tax_month").required(),
  end_tax_month: Joi.string().label("end_tax_month").required(),
  allowed_days: Joi.number().label("allowed_days").required(),
};

const tripsSchema = {
  country: Joi.string().label("Country").required(),
  entryDate: Joi.string().label("Entry date").required(),
  exitDate: Joi.string().label("Exit date").required(),
  images: Joi.array().items(Joi.string()),
};

const addTripImageSchema = {
  image: Joi.string().label("Image").required(),
};

const subscriptionSchema = {
  name: Joi.string().label("name").required(),
  price: Joi.number().label("price").required(),
  duration: Joi.string().label("duration").required(),
  trial_period: Joi.number().label("trial_period").required(),
  best_value: Joi.boolean().label("best_value").optional(),
  description: Joi.string().label("description").optional(),
  status: Joi.boolean().label("status").optional(),
};

const updatePasswordSchema = {
  password: Joi.string().label("password").required(),
  new_password: Joi.string().label("new_password").required(),
};

const attachPaymentMethodSchema = {
  source: Joi.string().label("source").required(),
};

module.exports = {
  validate,
  registerSchema: Joi.object(registerSchema),
  loginSchema: Joi.object(loginSchema),
  forgetPasswordSchema: Joi.object(forgetPasswordSchema),
  resetPasswordSchema: Joi.object(resetPasswordSchema),
  updateProfileSchema: Joi.object(updateProfileSchema),
  countriesSchema: Joi.object(countriesSchema),
  tripsSchema: Joi.object(tripsSchema),
  addTripImageSchema: Joi.object(addTripImageSchema),
  subscriptionSchema: Joi.object(subscriptionSchema),
  updatePasswordSchema: Joi.object(updatePasswordSchema),
  attachPaymentMethodSchema: Joi.object(attachPaymentMethodSchema),
};
