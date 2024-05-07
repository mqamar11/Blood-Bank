const { RECURRING_INTERVALS, DEFAULT_CURRENCY } = require("@constants/stripe");

const amountToCents = (amount) => Math.round(amount * 100);

const getRecurring = (payload) => {
  const recurring = RECURRING_INTERVALS[payload.duration];
  if (payload.duration === "days")
    recurring.interval_count = payload.frequencyDays;
  return recurring;
};

const getProductObj = (payload) => {
  return {
    name: payload.name,
    active: payload.status,
    description: payload.description,
  };
};

const getPriceObj = (payload) => {
  return {
    active: payload.status,
    nickname: payload.name,
    currency: DEFAULT_CURRENCY,
    recurring: getRecurring(payload),
    unit_amount: amountToCents(payload.price),
  };
};

const getPlanObj = (payload) => {
  return {
    product: getProductObj(payload),
    price: getPriceObj(payload),
  };
};

module.exports = {
  amountToCents,
  getRecurring,
  getProductObj,
  getPlanObj,
};
