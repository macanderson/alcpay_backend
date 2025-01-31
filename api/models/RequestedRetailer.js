module.exports = {
  tableName: "requested_retailers",
  attributes: {
    userId: {
      columnName: "user_id",
      type: "number",
      columnType: "int not null",
    },
    businessName: {
      columnName: "business_name",
      type: "string",
      columnType: "varchar(128) not null",
    },
    email: {
      columnName: "email",
      unique: false,
      type: "string",
      columnType: "varchar(128) not null",
    },
    contact: {
      columnName: "contact",
      type: "string",
      columnType: "varchar(16) not null",
    },
    website: {
      columnName: "website",
      type: "string",
      columnType: "varchar(128) not null",
    },
    stripe: {
      columnName: "stripe",
      type: "boolean",
      columnType: "boolean default false not null",
    },
    inHouseBusiness: {
      columnName: "in_house_business",
      type: "boolean",
      defaultsTo: false,
      columnType: "boolean default false not null",
    },
    shopify_location: {
      columnName: "shopify_location",
      type: "json",
      columnType: "json",
    },
    rating: {
      columnName: "rating",
      type: "number",
      columnType: "int default 0 not null",
    },
    isRequested: {
      columnName: 'is_requested',
      type: 'boolean',
      defaultsTo: false,
      columnType: 'boolean default false not null'
    //   type: 'string',
    //  defaultsTo: "pending",
    //   columnType: "enum('pending', 'accepted', 'rejected') not null"
  }
  }
};
