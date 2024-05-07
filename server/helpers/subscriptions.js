const UserSubscriptions = require("@models/userSubscription");
const { SUBSCRIPTION_STATUS } = require("@constants/stripe");

exports.getUserCurrentSubscription = async (user) => {
  return await UserSubscriptions.findOne({
    user,
    "sourceData.status": {
      $in: [SUBSCRIPTION_STATUS.trialing, SUBSCRIPTION_STATUS.active],
    },
  });
};
