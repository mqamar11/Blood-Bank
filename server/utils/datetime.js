const moment = require("moment");
require("moment-timezone");

const getCurrentTimeUnix = () => moment().unix();

module.exports = {
  getCurrentTimeUnix,
};
