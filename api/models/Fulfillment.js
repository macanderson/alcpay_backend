module.exports = {
  tableName: 'fulfillments',
  attributes: {
    fulfillmentId: {
      type: 'string',
      columnName: 'fulfillment_id',
      columnType: 'varchar(128)'
    },
    amount: {
      type: 'number',
      columnName: 'shipping_amount',
      columnType: 'decimal(15,2)'
    },
    status: {
      type: 'boolean',
      columnName: 'status',
      columnType: 'tinyint'
    },
    accountId: {
      type: 'number',
      columnName: 'account_id',
      columnType: 'int'
    },
    transferStatus: {
      type: 'boolean',
      columnName: 'transfer_status',
      columnType: 'tinyint(1)',
      defaultsTo: false
    },
    transferComment: {
      type: 'string',
      columnName: 'transfer_comment',
      columnType: 'varchar(255)'
    },
    orderNumber: {
      type: 'string',
      columnName: 'order_number',
      columnType: 'varchar(10)'
    },
    shopifyOrderId: {
      type: 'string',
      columnName: 'shopify_order_id',
      columnType: 'varchar(255)'
    },
    shopifyTrackingNumber: {
      type: 'string',
      columnName: 'shopify_tracking_number',
      columnType: 'text',
      allowNull: true
    },
    shopifyTrackingLink: {
      type: 'string',
      columnName: 'shopify_tracking_link',
      columnType: 'text',
      allowNull: true
    },
    shopifyTrackingTimestamp: {
      type: 'string',
      columnName: 'shopify_tracking_timestamp',
      columnType: 'varchar(255)',
      allowNull: true
    },
    shopifyTrackingStatus: {
      type: 'string',
      columnName: 'shopify_tracking_status',
      columnType: 'varchar(45)',
      allowNull: true
    },
    shopifyTrackingUpdateAt: {
      type: 'string',
      columnName: 'shopify_tracking_update_at',
      columnType: 'varchar(255)',
      allowNull: true
    },
    brandId: {
      type: 'string',
      columnName: 'brand_id',
      columnType: 'varchar(32)'
    },
  }
};
