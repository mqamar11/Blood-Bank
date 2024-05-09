const Configurations = require("@models/configurations");
const { DEFAULT_ACCOUNT_TRIAL_DAYS } = require("@constants");

exports.getOrCreateConfig = async (payload) => {
  const record = await Configurations.findOne({});
  if (!record) {
    const data = payload ?? {
      account_trial_days: DEFAULT_ACCOUNT_TRIAL_DAYS,
    };
    return await Configurations.create(data);
  }
  return record;
};
