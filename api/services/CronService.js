const cron = require('node-cron');
const Moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

cron.schedule('*/1 * * * *', async () => {
  try {
    // sails.log.info('Payout Cron - ', Moment());

    const payouts = await Payout.find({ status: false });
    if (!_.isEmpty(payouts)) {
      for (const payout of payouts) {

        const accountInfo = await Account.find({ accountId: payout.destination });
        const inHouseBusiness = (accountInfo[0]) ? accountInfo[0].inHouseBusiness : false;
        if (!inHouseBusiness) {
	console.log("payout destination=",payout.destination);
          await stripe.transfers.create({
            amount: parseInt(payout.amount) * 100,
            currency: 'usd',
            destination: payout.destination,
          },
            (err, transfer) => {
              // asynchronously called
              if (err) {
                sails.log.error(err);
              } else {
                sails.log.debug(transfer);
                const transferredAmount = (transfer.amount) / 100;
                const balance = payout.amount - transferredAmount;
                Payout.update({ id: payout.id }).set({ status: true }).then(() => sails.log.info(`Payment processed for ${payout.id}`));
                Balance.findOne({ accountId: payout.destination }).then((res) => {
                  if (res) {
                    Balance.update({ accountId: payout.destination }).set({ balance: res.balance + balance }).then(() => sails.log.info('Balance updated'));
                  } else {
                    Balance.create({ accountId: payout.destination, balance: balance, retailerName: payout.retailerName }).then(() => 'Balance created');
                  }
                });
              }
            }
          );
        } else {
          const balance = payout.amount;
          Payout.update({ id: payout.id }).set({ status: true }).then(() => sails.log.info(`Payment processed for ${payout.id}`));
          Balance.findOne({ accountId: payout.destination }).then((res) => {
            if (res) {
              Balance.update({ accountId: payout.destination }).set({ balance: res.balance + balance }).then(() => sails.log.info('Balance updated'));
            }
            else {
              Balance.create({ accountId: payout.destination, balance: balance, retailerName: payout.retailerName }).then(() => 'Balance created');
            }
          });
        }
      }
    }
  } catch (e) {
    sails.log.error('Error transferring ', e);
  }
});

cron.schedule('*/1 * * * *', async () => {
  try {
    // sails.log.info('Balance Cron - ', Moment());

    const balances = await Balance.find({ balance: { '>': 1.00 } });
    if (!_.isEmpty(balances)) {
      for (let balance of balances) {
        const accountInfo = await Account.find({ accountId: balance.destination });
        const inHouseBusiness = (accountInfo[0]) ? accountInfo[0].inHouseBusiness : false;
        if (!inHouseBusiness) {
          await stripe.transfers.create({
            amount: parseInt(balance.balance) * 100,
            currency: 'usd',
            destination: balance.accountId,
          },
            (err, transfer) => {
              if (err) {
                sails.log.info(`error settling balance for ${balance.accountId}`);
              } else {
                const transferredAmount = transfer.amount / 100;
                const balanceAmount = balance.balance - transferredAmount;
                Balance.update({ accountId: balance.accountId }).set({ balance: balanceAmount }).then(() =>
                  sails.log.info('Balance updated for' + balance.accountId));
              }
            });
        } else {
          // sails.log.info('Stripe Transfer will not be processed for In-House Retailer - ' + accountInfo[0].businessName);
        }
      }
    }
  } catch (e) {
    sails.log.error('Error transferring ', e);
  }
});


