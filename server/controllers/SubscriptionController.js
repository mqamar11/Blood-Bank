const { apiResponse } = require("@helpers/helpers");
const Subscription = require("@models/subscription");
const SearchOptions = require("@utils/searchOptions");

exports.create = async (req, res) => {
  try {
    const { name, price, duration, trial_period, best_value, description, currency, status}=req.body;
    const createdSubscription = await Subscription.create({
      name,
      price,
      duration,
      trial_period,
      best_value,
      description,
      currency,
      status,
    });
    return apiResponse(
      req,
      res,
      createdSubscription,
      201,
      "Subscription created successfully."
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const query = { name: { $regex: new RegExp(req.query.search ?? "", "i") } };
    const total = await Subscription.countDocuments(query);
    const records =
      total > 0
        ? await Subscription.find(query, null, new SearchOptions(req.query))
        : [];

    return apiResponse(
      req,
      res,
      { total, records },
      200,
      "Records retrieved Successfully."
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription)
      return apiResponse(req, res, {}, 404, "Subscription not found");
    return apiResponse(
      req,
      res,
      subscription,
      200,
      "Record retrieved Successfully."
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const { name, price, duration, trial_period, best_value, description, currency, status}=req.body;
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        duration,
        trial_period,
        best_value,
        description,
        currency,
        status
      },
      { new: true }
    );
    if (!subscription)
      return apiResponse(req, res, {}, 404, "Subscription not found");
    return apiResponse(
      req,
      res,
      subscription,
      200,
      "Subscription updated successfully"
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription)
      return apiResponse(req, res, {}, 404, "Subscription not found");
    return apiResponse(req, res, {}, 200, "Subscription deleted successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};
