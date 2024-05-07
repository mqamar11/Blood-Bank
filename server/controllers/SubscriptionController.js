const { apiResponse } = require("@utils");
const Subscription = require("@models/subscription");
const SearchOptions = require("@utils/searchOptions");
const { DEFAULT_CURRENCY } = require("@constants/stripe");
const {
  getOrCreatePaymentUser,
  createPlan,
  updatePlan,
  removePlan,
  createSubscription,
  updateSubscription,
} = require("@services/stripe");
const { getUserCurrentSubscription } = require("@helpers/subscriptions");

exports.create = async (req, res) => {
  try {
    const {
      name,
      price,
      duration,
      trial_period,
      best_value,
      description,
      status,
    } = req.body;

    const record = await Subscription.create({
      name,
      price,
      duration,
      trial_period,
      best_value,
      description,
      currency: DEFAULT_CURRENCY,
      status,
    });

    await createPlan(record);

    return apiResponse(
      req,
      res,
      record,
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
    const {
      name,
      price,
      duration,
      trial_period,
      best_value,
      description,
      status,
    } = req.body;

    const record = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        duration,
        trial_period,
        best_value,
        description,
        status,
      },
      { new: true }
    ).select("+sourceData");

    if (!record)
      return apiResponse(req, res, {}, 404, "Subscription not found");

    if (record.sourceData) {
      await updatePlan(record);
      record.sourceData = undefined;
    } else await createPlan(record);

    return apiResponse(
      req,
      res,
      record,
      200,
      "Subscription updated successfully"
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const record = await Subscription.findById(req.params.id).select(
      "+sourceData"
    );

    if (!record)
      return apiResponse(req, res, {}, 404, "Subscription not found");

    if (record.sourceData) await removePlan(record.sourceData);
    await Subscription.findByIdAndDelete(req.params.id);

    return apiResponse(req, res, {}, 200, "Subscription deleted successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.purchase = async (req, res) => {
  try {
    // validate subscription
    const record = await Subscription.findById(req.params.id)
      .select("+sourceData")
      .lean();
    if (!record || !record.sourceData)
      return apiResponse(req, res, {}, 404, "Subscription not found");

    // validate payment user
    const payer = await getOrCreatePaymentUser(req.user);
    if (
      payer.default_source == null &&
      payer.invoice_settings.default_payment_method == null
    ) {
      return apiResponse(req, res, {}, 500, "No payment method found.");
    }

    const prev = await getUserCurrentSubscription(req.user._id);
    if (prev) {
      if (prev.subscription == record.id)
        return apiResponse(req, res, {}, 500, "Already subscribed.");
      await updateSubscription();
    } else await createSubscription(record, req.user.paymentSource);

    return apiResponse(req, res, {}, 200, "Purchased successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};
