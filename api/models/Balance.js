module.exports = {
  tableName: 'balances',
  attributes: {
    accountId: {
      type: 'string',
      columnName: 'account_id',
      columnType: 'varchar(32)'
    },
    balance: {
      type: 'number',
      columnName: 'balance',
      columnType: 'decimal (10,2)'
    },
    retailerName: {
      type: 'string',
      columnName : 'retailer_name',
      columnType: 'varchar(64)'
    }
  }
};
