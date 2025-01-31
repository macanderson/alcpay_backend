module.exports = {
  tableName: "state_location_map",
  attributes: {
    states: {
      type: "json",
      columnName: "states",
      columnType: "json",
    },
    locationId: {
      type: "string",
      columnName: "location_id",
      columnType: "varchar(64)",
    },
    locationName: {
      columnName: "location_name",
      type: "string",
      columnType: "varchar(255) not null",
    },
    // productId: {
    //   type: "string",
    //   columnName: "product_id",
    //   columnType: "varchar(64)",
    // },
    // productName: {
    //   columnName: "product_name",
    //   type: "string",
    //   columnType: "varchar(255) not null",
    // },
    products: {
      type: "json",
      columnName: "products",
      columnType: "products",
    },
    brandId: {
      type: 'string',
      columnName: 'brand_id',
      columnType: 'varchar(32)'
    },
  },
};
