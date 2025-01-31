module.exports = {
  tableName: 'product_location_map',
  attributes: {
    locationId: {
      type: 'string',
      columnName: 'location_id',
      columnType: 'varchar(64)'
    },
    locationName: {
      columnName: 'location_name',
      type: 'string',
      columnType: 'varchar(255) not null'
    },
    products:{
      type: "json",
      columnName: "products",
      columnType: "json",
    },
    brandId: {
      type: 'string',
      columnName: 'brand_id',
      columnType: 'varchar(32)'
    },
  }
};
