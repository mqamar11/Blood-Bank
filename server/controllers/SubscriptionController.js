const { apiResponse } = require("@utils");
const Subscription = require("@models/subscription");
const SearchOptions = require("@utils/searchOptions");
const {
  DEFAULT_CURRENCY,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_ACTIVE_STATUS,
} = require("@constants/stripe");
const {
  getOrCreatePaymentUser,
  createPlan,
  updatePlan,
  removePlan,
  createSubscription,
  updateSubscription,
  cancelSubscription,
} = require("@services/stripe");
const { getUserCurrentSubscription } = require("@helpers/subscriptions");
const UserSubscriptions = require("@models/userSubscription");

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
    record.deleted = undefined;
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
    const query = {
      deleted: { $ne: true },
      name: { $regex: new RegExp(req.query.search ?? "", "i") },
    };
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
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      deleted: { $ne: true },
    });

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

    const record = await Subscription.findOneAndUpdate(
      { _id: req.params.id, deleted: { $ne: true } },
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
    const record = await Subscription.findOne({
      _id: req.params.id,
      deleted: { $ne: true },
    }).select("+sourceData");

    if (!record)
      return apiResponse(req, res, {}, 404, "Subscription not found");

    if (record.sourceData) await removePlan(record.sourceData);

    const purchasedCount = await UserSubscriptions.countDocuments({
      subscription: record._id,
    });

    if (purchasedCount > 0)
      await Subscription.findByIdAndUpdate(req.params.id, { deleted: true });
    else await Subscription.findByIdAndDelete(req.params.id);

    return apiResponse(req, res, {}, 200, "Subscription deleted successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.purchase = async (req, res) => {
  try {
    // validate subscription
    const record = await Subscription.findOne({
      _id: req.params.id,
      deleted: { $ne: true },
    })
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

    let purchasedRecord = null;
    const prev = await getUserCurrentSubscription(req.user._id);
    if (prev) {
      if (prev.subscription.toString() == req.params.id)
        return apiResponse(req, res, {}, 500, "Already subscribed.");
      purchasedRecord = await updateSubscription(record, req.user, prev);
    } else {
      purchasedRecord = await createSubscription(record, req.user);
    }

    return apiResponse(
      req,
      res,
      purchasedRecord,
      200,
      "Purchased successfully"
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.cancel = async (req, res) => {
  try {
    const record = await UserSubscriptions.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).lean();

    if (!record)
      return apiResponse(req, res, {}, 404, "Subscription not found");

    const { cancel_at_period_end = true } = req.body;

    if (
      record.sourceData?.status === SUBSCRIPTION_STATUS.canceled ||
      (record.sourceData?.cancel_at_period_end && cancel_at_period_end)
    )
      return apiResponse(req, res, {}, 404, "Subscription already canceled");

    const sourceData = await cancelSubscription(
      record.sourceData.id,
      cancel_at_period_end
    );

    const updated = await UserSubscriptions.findByIdAndUpdate(
      req.params.id,
      { sourceData },
      { new: true }
    );

    return apiResponse(req, res, updated, 200, "Canceled successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return apiResponse(req, res, {}, 404, "userId is required");

    const current = await getUserCurrentSubscription(userId);

    const query = {
      user: userId,
      "sourceData.status": { $nin: SUBSCRIPTION_ACTIVE_STATUS },
    };
    const total = await UserSubscriptions.countDocuments(query);
    const records =
      total > 0
        ? await UserSubscriptions.find(
            query,
            null,
            new SearchOptions(req.query)
          )
        : [];

    return apiResponse(
      req,
      res,
      {
        current,
        history: {
          total,
          records,
        },
      },
      200,
      "Records retrieved Successfully."
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};
