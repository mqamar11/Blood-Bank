const { apiResponse } = require("@utils");
const config = require("@config");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const countryRoutes = require("./countryRoutes");
const tripRoutes = require("./tripRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const configurationRoutes = require("./configurationRoutes");

module.exports = (app) => {
  app.use(`/${config.apiPrefix}`, authRoutes);
  app.use(`/${config.apiPrefix}`, userRoutes);
  app.use(`/${config.apiPrefix}`, countryRoutes);
  app.use(`/${config.apiPrefix}`, tripRoutes);
  app.use(`/${config.apiPrefix}`, subscriptionRoutes);
  app.use(`/${config.apiPrefix}`, configurationRoutes);

  app.use(`/${config.apiPrefix}`, (req, res) => {
    return apiResponse(
      req,
      res,
      {},
      404,
      `No API route found: ${config.apiPrefix}${req.path}`
    );
  });
};
