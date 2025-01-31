module.exports = {
    tableName: 'account_ratings',
    attributes: {
        accountId: { // retailer 
            model: 'account', // The related model name
            required: true,
            columnName: "account_id"
        },
        communication: {
            columnName: 'comm_rating',
            type: 'string',
            columnType: 'varchar(128) not null',
            allowNull: false

        },
        speed: {
            columnName: 'speed_rating',
            type: 'string',
            columnType: 'varchar(128) not null',
            allowNull: false
        },
        price: {
            columnName: 'price_rating',
            type: 'string',
            columnType: 'varchar(128) not null',
            allowNull: false
        },
        brandId: {
            columnName: 'brand_id',
            type: 'string',
            columnType: 'varchar(128) not null',
            allowNull: false
        },
        fulfillmentId: {
            columnName: 'fulfillment_id',
            type: 'string',
            columnType: 'varchar(128) not null',
            allowNull: false
        },

    }
}