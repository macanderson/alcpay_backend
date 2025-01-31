module.exports = {
    tableName: 'account_state',
    attributes: {
        account: {
            model: 'account'
        },
        states: {
            model: 'states'
        },
    }
};
