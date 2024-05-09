const UserSubscriptions = require("@models/userSubscription");
const { SUBSCRIPTION_ACTIVE_STATUS } = require("@constants/stripe");

const getUserCurrentSubscription = async (user) => {
  return await UserSubscriptions.findOne({
    user,
    "sourceData.status": { $in: SUBSCRIPTION_ACTIVE_STATUS },
  });
};

const isSubscribed = async (user) => {
  return !!(await getUserCurrentSubscription(user));
};

const populateSubscriptionStatus = async (user) => {
  user.subscription = await isSubscribed(user._id);
  return user;
};

module.exports = {
  getUserCurrentSubscription,
  isSubscribed,
  populateSubscriptionStatus,
};
