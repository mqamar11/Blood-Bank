const { RECURRING_INTERVALS, DEFAULT_CURRENCY } = require("@constants/stripe");
const { dateToUnix } = require("@utils/datetime");

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

const getTrialEndUnix = (trialDays, toDate = null) => {
  const current = toDate || new Date();
  current.setDate(current.getDate() + trialDays);
  return dateToUnix(current);
};

const getPreviousPhases = (phases) => {
  const list = [];
  for (const i in phases) {
    let obj = {
      items: phases[i].items,
      start_date: phases[i].start_date,
      end_date: phases[i].end_date,
    };

    if (phases[i].metadata && Object.keys(phases[i].metadata).length > 0)
      obj = { ...obj, metadata: phases[i].metadata };

    if (phases[i].trial_end) obj = { ...obj, trial_end: phases[i].trial_end };

    if (phases[i].default_tax_rates && phases[i].default_tax_rates.length > 0) {
      const taxIds = [];
      phases[i].default_tax_rates.map((taxItem) => {
        if (typeof taxItem === "string") {
          taxIds.push(taxItem);
        } else if (taxItem.active) {
          taxIds.push(taxItem.id);
        }
      });
      obj = { ...obj, default_tax_rates: taxIds };
    }

    // if (phases[i].default_payment_method) obj = { ...obj, default_payment_method: phases[i].default_payment_method };
    list.push(obj);
  }
  return list;
};

module.exports = {
  amountToCents,
  getRecurring,
  getProductObj,
  getPlanObj,
  getTrialEndUnix,
  getPreviousPhases,
};
