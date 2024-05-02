require("dotenv").config();
require("module-alias/register");
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const http = require("http");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const logger = require("@base/logger");
const config = require("@config");
const db = require("@base/db");
const middleware = require("@base/middleware");

require("@base/logger/fileLogger")();
global.jwt = require("jsonwebtoken");

const promiseApp = async () => {
  return new Promise((resolve) => {
    const app = express();

    app.disable("x-powered-by");
    app.enable("trust proxy");

    app.use(morgan("combined"));

    if (config.rateLimitOn) app.use(rateLimit(config.rateLimitOptions));

    app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

    app.use(cookieParser());
    app.use(methodOverride());

    app.set("view engine", config.viewEngine.engine);
    app.set("views", config.viewEngine.options.views);

    app.use(cors(config.cors));
    app.use(fileUpload());

    app.use(middleware.userTokenMiddleware);
    app.use(middleware.compression);
    app.use("/public", middleware.staticFileMiddleware);

    app.use(bodyParser.json({ limit: "20mb" }));

    require("@routes")(app);

    app.use(middleware.errors);

    resolve(app);
  });
};

const promiseServer = async (app) => {
  return new Promise((resolve) => {
    const server = http.Server(app);
    resolve(server);
  });
};

const promiseRun = (server) => {
  return new Promise((resolve) => {
    server.listen(config.port, () => {
      logger.info(`Server started and listening on the port ${config.port}`);
      resolve();
    });
  });
};

async function initialize() {
  await db.initialize();
  logger.info("Database connection initialized. ");

  const app = await promiseApp();
  const server = await promiseServer(app);
  logger.info("Server initialized.");

  await promiseRun(server);
}

initialize();
