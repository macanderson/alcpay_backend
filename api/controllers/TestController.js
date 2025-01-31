module.exports = {


  testBalance: async (req, res) => {
    const transfer = {
      'id': 'tr_1HMDFoHcEEV3pB6Ssp86TFnc',
      'object': 'transfer',
      'amount': 100,
      'amount_reversed': 0,
      'balance_transaction': 'txn_1HMDFoHcEEV3pB6SjfUETqDi',
      'created': 1598881260,
      'currency': 'usd',
      'description': null,
      'destination': 'acct_1HHAsHEVaNoUnd6P',
      'destination_payment': 'py_1HMDFoEVaNoUnd6PUqmBnS2G',
      'livemode': true,
      'metadata': {},
      'reversals': {
        'object': 'list',
        'data': [],
        'has_more': false,
        'total_count': 0,
        'url': '/v1/transfers/tr_1HMDFoHcEEV3pB6Ssp86TFnc/reversals'
      },
      'reversed': false,
      'source_transaction': null,
      'source_type': 'card',
      'transfer_group': null
    };

    const balances = await Balance.find( {balance: {'>': 1.00}});
    if (!_.isEmpty(balances)) {
      for (let balance of balances) {
        sails.log.debug(balance);
        const transferredAmount = transfer.amount / 100;
        const balanceAmount = balance.balance - transferredAmount;
        sails.log.debug(balanceAmount);
        Balance.update({id: balance.id}).set({balance: balanceAmount}).then(() =>
          sails.log.info('Balance updated for' + balance.accountId));
      }
    }

    return res.ok({});
  }
};
