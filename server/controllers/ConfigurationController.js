const { apiResponse } = require("@utils");
const { getOrCreateConfig } = require("@helpers/configurations");
const Configurations = require("@models/configurations");

exports.get = async (req, res) => {
  try {
    const record = await getOrCreateConfig();
    return apiResponse(req, res, record, 201, "Retrieved Successfully.");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const { account_trial_days, subscription_on_register } = req.body;

    const record = await getOrCreateConfig({
      account_trial_days,
      subscription_on_register,
    });

    return apiResponse(req, res, record, 200, "Created Successfully.");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const { account_trial_days, subscription_on_register } = req.body;
    let record = await getOrCreateConfig();
    record = await Configurations.findByIdAndUpdate(
      record._id,
      {
        account_trial_days,
        subscription_on_register,
      },
      { new: true }
    );

    return apiResponse(req, res, record, 200, "Updated Successfully.");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};
