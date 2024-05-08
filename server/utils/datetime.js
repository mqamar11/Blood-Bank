const moment = require("moment");
require("moment-timezone");

const getCurrentTimeUnix = () => moment().unix();

const dateToUnix = (dateTimeStamp = null) => {
  const timeStamp = dateTimeStamp
    ? new Date(dateTimeStamp).getTime()
    : Date.now();
  return Math.floor(timeStamp / 1000);
};

const unixToDateTime = (unixTimestamp) => new Date(unixTimestamp * 1000);

module.exports = {
  getCurrentTimeUnix,
  dateToUnix,
  unixToDateTime,
};
