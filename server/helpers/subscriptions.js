const UserSubscriptions = require("@models/userSubscription");
const { SUBSCRIPTION_STATUS } = require("@constants/stripe");

const getUserCurrentSubscription = async (user) => {
  return await UserSubscriptions.findOne({
    user,
    "sourceData.status": {
      $in: [
        SUBSCRIPTION_STATUS.trialing,
        SUBSCRIPTION_STATUS.active,
        SUBSCRIPTION_STATUS.past_due,
        SUBSCRIPTION_STATUS.paused,
      ],
    },
  });
};

const isSubscribed = async (user) => {
  return !!(await getUserCurrentSubscription(user));
};

module.exports = {
  getUserCurrentSubscription,
  isSubscribed,
};
