const config = require("@config");
const stripe = require("stripe")(config.stripe.apiKey);
const logger = require("@base/logger");
const { apiResponse } = require("@utils");
const UserSubscriptions = require("@models/userSubscription");
const { retrieveSubscription } = require("@services/stripe");

// Stripe CLI webhook secret.
const endpointSecret = config.stripe.endPointSecret;

const onSubscriptionCancel = async (subscriptionObj) => {
  const subscription = await UserSubscriptions.findOneAndUpdate(
    {
      "sourceData.id": subscriptionObj.id,
    },
    { sourceData: subscriptionObj },
    { new: true }
  );
  return subscription ?? null;
};

const onSubscriptionInvoicePaid = async (eventObj) => {
  const sourceData = await retrieveSubscription(eventObj.subscription);
  const subscription = await UserSubscriptions.findOneAndUpdate(
    {
      "sourceData.id": eventObj.subscription,
    },
    { sourceData },
    { new: true }
  );
  return subscription ?? null;
};

const onSubscriptionInvoiceFailed = async (eventObj) => {
  const sourceData = await retrieveSubscription(eventObj.subscription);
  const subscription = await UserSubscriptions.findOneAndUpdate(
    {
      "sourceData.id": eventObj.subscription,
    },
    { sourceData },
    { new: true }
  );
  return subscription ?? null;
};

const onSubscriptionUpdate = async (subscriptionObj) => {
  const updatedSubscription = subscriptionObj.data.object;
  const subscription = await UserSubscriptions.findOneAndUpdate(
    {
      "sourceData.id": updatedSubscription.id,
    },
    { sourceData: updatedSubscription },
    { new: true }
  );
  return subscription ?? null;
};

// const onSubscriptionTrialEnd = async (subscriptionObj) => {
//   const subscription = await UserSubscriptions.findOne({
//     "sourceData.id": subscriptionObj.id,
//   });
//   return subscription ?? null;
// };

exports.webhook = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = await stripe.webhooks.constructEvent(
      request.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    apiResponse(req, res, {}, 400, `Webhook Error: ${err.message}`);
    return logger.error(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    // to handle subscription cancel
    case "customer.subscription.deleted":
      await onSubscriptionCancel(event.data.object);
      break;

    // to handle subscription renewal
    case "invoice.paid":
      await onSubscriptionInvoicePaid(event.data.object);
      break;

    // to handle subscription payment tries
    case "invoice.payment_failed":
      await onSubscriptionInvoiceFailed(event.data.object);
      break;

    // to handle subscription update
    case "customer.subscription.updated":
      await onSubscriptionUpdate(event);
      break;

    // to handle subscription trial end
    // case "customer.subscription.trial_will_end":
    //   await onSubscriptionTrialEnd(event.data.object);
    //   break;

    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  response.send();
};
