const DEFAULT_CURRENCY = "usd";

const DURATION = {
  YEAR: "year",
  MONTH: "month",
};

const RECURRING_INTERVALS = {
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

const SUBSCRIPTION_STATUS = {
  incomplete: "incomplete",
  incomplete_expired: "incomplete_expired",
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  canceled: "canceled",
  unpaid: "unpaid",
  paused: "paused",
};

const SUBSCRIPTION_ACTIVE_STATUS = [
  SUBSCRIPTION_STATUS.trialing,
  SUBSCRIPTION_STATUS.active,
  SUBSCRIPTION_STATUS.past_due,
  SUBSCRIPTION_STATUS.paused,
];

module.exports = {
  DEFAULT_CURRENCY,
  DURATION,
  RECURRING_INTERVALS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_ACTIVE_STATUS,
};
