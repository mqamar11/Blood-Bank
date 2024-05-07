const config = require("@config");
const stripe = require("stripe")(config.stripe.apiKey);

const User = require("@models/user");
const Subscription = require("@models/subscription");
const { getPlanObj } = require("@helpers/stripe");

// payment user services
const getPaymentUser = async (customerId) => {
  return await stripe.customers.retrieve(customerId);
};
const getOrCreatePaymentUser = async (user) => {
  const paymentSource = user.paymentSource
    ? await getPaymentUser(user.paymentSource.id)
    : await stripe.customers.create({
        email: user.email,
        name: user.name,
      });

  await User.findByIdAndUpdate(user._id, { paymentSource });
  return paymentSource;
};
const updatePaymentUser = async (user) => {
  const paymentSource = await stripe.customers.update(user.paymentSource.id, {
    name: user.name,
  });
  await User.findByIdAndUpdate(user._id, { paymentSource });
  return paymentSource;
};

// Payment methods
const createPaymentMethod = async (card) => {
  return await stripe.paymentMethods.create(card);
};
const attachPaymentMethod = async (paymentMethod, customer) => {
  return await stripe.paymentMethods.attach(paymentMethod, { customer });
};
const detachPaymentMethod = async (paymentMethod) => {
  return await stripe.paymentMethods.detach(paymentMethod);
};
const addCustomerPaymentMethod = async (
  customerId,
  source,
  isDefault = true
) => {
  try {
    // create payment method
    const paymentMethod = await createPaymentMethod({
      type: "card",
      "card[token]": source,
    });

    // attach to customer
    await attachPaymentMethod(paymentMethod.id, customerId);
    if (isDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethod.id },
      });
    }

    return true;
  } catch (error) {
    throw new Error(error);
  }
};
const getCustomerPaymentMethods = async (customerId) => {
  return await stripe.customers.listPaymentMethods(customerId, {
    type: "card",
  });
};

// Products services
const createProduct = async (product) => {
  return await stripe.products.create(product);
};
const updateProduct = async (productId, product) => {
  return await stripe.products.update(productId, product);
};
const archiveProduct = async (productId) => {
  return await stripe.products.update(productId, {
    active: false,
  });
};

// Price services
const getProductPrice = async (priceId) => {
  return await stripe.prices.retrieve(priceId);
};
const createProductPrice = async (price) => {
  return await stripe.prices.create(price);
};
const updateProductPrice = async (priceId, price) => {
  return await stripe.prices.update(priceId, {
    active: price.active,
    nickname: price.nickname,
  });
};
const archiveProductPrice = async (priceId) => {
  return await stripe.prices.update(priceId, {
    active: false,
  });
};
const getProductActivePrices = async (product, limit = 100) => {
  return await stripe.prices.list({ active: true, product, limit });
};

// Plans services
const createPlan = async (payload) => {
  const plan = getPlanObj(payload);

  // create product
  const stripeProduct = await createProduct(plan.product);

  // create price
  plan.price.product = stripeProduct.id;
  const stripePrice = await createProductPrice(plan.price);

  const sourceData = {
    productId: stripeProduct.id,
    priceId: stripePrice.id,
  };

  await Subscription.findByIdAndUpdate(payload._id, { sourceData });
  return sourceData;
};
const updatePlan = async (payload) => {
  try {
    const plan = getPlanObj(payload);

    // update product
    const stripeProduct = await updateProduct(
      payload.sourceData.productId,
      plan.product
    );

    // update price
    let stripePrice = await getProductPrice(payload.sourceData.priceId);

    if (
      stripePrice.unit_amount != plan.price.unit_amount ||
      stripePrice.recurring.interval != plan.price.recurring.interval
    ) {
      if (stripePrice.active)
        await archiveProductPrice(payload.sourceData.priceId);
      plan.price.product = payload.sourceData.productId;
      stripePrice = await createProductPrice(plan.price);
    } else if (
      stripePrice.active != plan.price.active ||
      stripePrice.nickname != plan.price.nickname
    ) {
      stripePrice = await updateProductPrice(
        payload.sourceData.priceId,
        plan.price
      );
    }

    const sourceData = {
      productId: stripeProduct.id,
      priceId: stripePrice.id,
    };

    if (payload.sourceData.priceId !== sourceData.priceId)
      await Subscription.findByIdAndUpdate(payload._id, { sourceData });

    return sourceData;
  } catch (error) {
    throw new Error(error);
  }
};
const removePlan = async (sourceData) => {
  try {
    // Archive all prices
    const stripePrices = await getProductActivePrices(sourceData.productId);
    for (const price of stripePrices.data) {
      await archiveProductPrice(price.id);
    }

    // Archive product
    await archiveProduct(sourceData.productId);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getPaymentUser,
  getOrCreatePaymentUser,
  updatePaymentUser,

  detachPaymentMethod,
  addCustomerPaymentMethod,
  getCustomerPaymentMethods,

  createPlan,
  updatePlan,
  removePlan,
};
