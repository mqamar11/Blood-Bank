const path = require("path");
const express = require("express");
const compression = require("compression");

const logger = require("@base/logger");
const validation = require("@base/validation");
const User = require("@models/user");
const jwtToken = require("@utils/jwtToken");
const { apiResponse } = require("@utils");
const fileLogger = require("@base/logger/fileLogger")();
const { USER_ROLES } = require("@constants");
const config = require("@config");

module.exports = exports = {};

const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query?.token) return req.query.token;
  return null;
};

exports.userTokenMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      // get user and update in request
      let decoded = jwtToken.verifyJwtToken(token, config.jwt.secret);
      decoded = JSON.parse(JSON.stringify(decoded));
      req.user = await User.findById(decoded.id);
    } else return next(null);
  } catch (error) {
    logger.error(
      `User token middleware error: ${error.message}, stack: ${error.stack}`
    );
    const status = error.status || 403;
    const message = error.userMessage || "Authorization method invalid";
    return res.status(status).json({ success: false, message });
  }
  next(null);
};

exports.loginRequired = (req, res, next) => {
  if (!req.user) return apiResponse(req, res, [], 401, "Unauthorized User");

  //   if (!req.user.isActive || !req.user.email_verified || req.user.deleted)
  //     return res
  //       .status(403)
  //       .json({ success: false, message: "User not confirmed or inactive" });

  next(null);
};

exports.adminRequired = (req, res, next) => {
  if (!req.user) return apiResponse(req, res, [], 401, "Unauthorized User");

  if (req.user.role === USER_ROLES.ADMIN) {
    next();
  } else {
    return apiResponse(
      req,
      res,
      [],
      403,
      "Access Forbidden. Admin privileges required."
    );
  }
};

exports.validate = (schema, source, validationOpts) => (req, res, next) => {
  if (!source) source = (request) => request.body;
  validationOpts || (validationOpts = { allowUnknown: true });

  const dataToValidate = source(req, res);
  const { error, value } = validation.validate(
    dataToValidate,
    schema,
    validationOpts
  );

  if (error) {
    logger.warn(`Payload validation error:`, error);
    return res.status(400).json({ error, success: false });
  }

  req.schema = schema;
  req.values = value;

  return next();
};

exports.errors = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  if (config.environment === "development") {
    const data = {
      error: err,
      stack: err.stack,
    };
    // winston.error(err.message,err);
    fileLogger.error(err.message, err);
    return apiResponse(req, res, data, err.statusCode, err.message);
  } else if (config.environment === "production") {
    //creating the copy of error
    const error = { ...err };

    error.message = err.message;

    //Handling Wrong Jwt error
    if (err.name === "JsonWebTokenError")
      err.message = "JSON Web Token is invalid. Try again!!!";

    //Handling Expired Jwt error
    if (err.name === "TokenExpiredError")
      err.message = "JSON Web Token is expired. Try again!!!";

    //Write error into log file

    // winston.error(err.message,err);
    fileLogger.error(err.message, err);

    //OR
    // winston.log('error',error.message);

    logger.warn(`error.message`, err.message);
    // return returnApiResponse(req, res, {}, 500,error.message || 'Internal Server Error');
    return apiResponse(req, res, {}, err.statusCode, "Internal Server Error");
  }
};

// STATIC CONTENT serving

exports.compression = compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
});

exports.staticFileMiddleware = express.static(
  path.join(__dirname, "../public")
);
