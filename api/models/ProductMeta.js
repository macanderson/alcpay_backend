module.exports = {
  tableName: 'product_meta',
  attributes: {
    productId: {
      type: 'string',
      columnType: 'varchar(16)',
      columnName: 'product_id'
    },
    variantId: {
      type: 'string',
      columnType: 'varchar(16)',
      columnName: 'variant_id'
    },
    imageUrl: {
      type: 'string',
      columnType: 'varchar(2048)',
      columnName: 'image_url'
    },
    handle: {
      type: 'string',
      columnName: 'handle',
      columnType: 'varchar(255)'
    },
    weight: {
      type: 'number',
      columnName: 'weight',
      columnType: 'decimal(15,2)'
    },
    weightUnit: {
      type: 'string',
      columnName: 'weight_unit',
      columnType: 'varchar(10)'
    },
    brand_id: {
      type: 'string',
      columnType: 'varchar(16)',
      columnName: 'brand_id',
      allowNull: true
    },
  }
};
