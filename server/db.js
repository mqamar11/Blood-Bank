const mongoose = require("mongoose");
const config = require("@base/config");
const logger = require("@base/logger");

module.exports.db = null;

module.exports.initialize = async () => {
  return new Promise((resolve, reject) => {
    mongoose.set("strictQuery", true);
    mongoose.connect(config.databaseUri);
    module.exports.db = mongoose.connection;

    module.exports.db.on("error", reject);
    module.exports.db.once("open", () => {
      resolve();
    });

    if (config.debug) {
      mongoose.set("debug", (collectionName, method, query, doc) => {
        logger.debug(
          `${collectionName}.${method}( ${JSON.stringify(
            query
          )} ) = ${JSON.stringify(doc)}`
        );
      });
    }
  });
};

module.exports.shutdown = async () => {
  if (module.exports.db) {
    await module.exports.db.close().then(() => {
      module.exports.db = null;
    });
  }
};
