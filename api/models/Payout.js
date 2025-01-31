module.exports = {
  tableName: 'payouts',
  attributes: {
    orderNumber: {
      type: 'string',
      columnType: 'varchar(10)',
      columnName: 'order_number'
    },
    amount: {
      type: 'number',
      columnType: 'decimal(10,2)',
      columnName: 'amount'
    },
    destination: {
      type: 'string',
      columnType: 'varchar(32)',
      columnName: 'destination'
    },
    retailerName: {
      type: 'string',
      columnType: 'varchar(64)',
      columnName: 'retailer_name'
    },
    status: {
      type: 'boolean',
      columnName: 'status',
      columnType: 'tinyint(1)',
      defaultsTo: false
    }
  }
}
