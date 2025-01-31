const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  transferFunds: async ( accountId, amount, metaInfo) => {
    return await stripe.transfers.create(
      {
        amount: parseInt(amount)*100,
        currency: 'usd',
        destination: accountId,
      },
      (err, transfer) => {
        // asynchronously called
        sails.log.error(err);
      }
    );
  },
  deleteAccount: async(accountId) => {
    return await stripe.account. del(accountId);
  }
};
