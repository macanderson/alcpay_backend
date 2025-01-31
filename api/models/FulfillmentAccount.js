module.exports = {
    tableName: 'fulfillment_account',
    attributes: {
        fulfillment: {
            model: 'fulfillment'
        },
        account: {
            model: 'account'
        },
    }
};
