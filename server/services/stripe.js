const config = require("@config");
const stripe = require("stripe")(config.stripe.apiKey);

const User = require("@models/user");

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

module.exports = {
  getPaymentUser,
  getOrCreatePaymentUser,
  updatePaymentUser,

  detachPaymentMethod,
  addCustomerPaymentMethod,
  getCustomerPaymentMethods,
};
