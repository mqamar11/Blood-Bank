const { USER_ROLES } = require("@constants");
const { populateSubscriptionStatus } = require("./subscriptions");
const { getOrCreateConfig } = require("./configurations");

const is_admin = (user) => user.role === USER_ROLES.ADMIN;

const resolveSessionAccess = async (user) => {
  user = await populateSubscriptionStatus(user);

  const { account_trial_days, subscription_on_register } =
    await getOrCreateConfig();

  user.configuration = {
    account_trial_days,
    subscription_on_register,
  };

  return user;
};

module.exports = {
  is_admin,
  resolveSessionAccess,
};
