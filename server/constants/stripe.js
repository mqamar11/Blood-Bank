exports.DEFAULT_CURRENCY = "usd";

exports.DURATION = {
  YEAR: "year",
  MONTH: "month",
};

exports.RECURRING_INTERVALS = {
  month: {
    interval: "month",
    interval_count: 1,
  },
  quarterly: {
    interval: "month",
    interval_count: 3,
  },
  "six-months": {
    interval: "month",
    interval_count: 6,
  },
  year: {
    interval: "year",
    interval_count: 1,
  },
  days: {
    interval: "day",
    interval_count: 1,
  },
};