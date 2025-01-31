module.exports = {
    tableName: 'accounts',
    attributes: {
        businessName: {
            columnName: 'business_name',
            type: 'string',
            columnType: 'varchar(128) not null'
        },
        email: {
            columnName: 'email',
            type: 'string',
            columnType: 'varchar(128) not null'
        },
        contact: {
            columnName: 'contact_no',
            type: 'string',
            columnType: 'varchar(16) not null'
        },
        website: {
            columnName: 'website',
            type: 'string',
            columnType: 'varchar(128) not null'
        },
        accountId: {
            columnName: 'account_id',
            type: 'string',
            columnType: 'varchar(128) not null'
        },
        locationId: {
            columnName: 'location_id',
            type: 'string',
            columnType: 'varchar(64) not null'
        },
        isActivated: {
            columnName: 'is_activated',
            type: 'boolean',
            defaultsTo: false,
            columnType: 'boolean default false not null'
        },
        locationName: {
            columnName: 'location_name',
            type: 'string',
            columnType: 'varchar(255) not null'
        },
        inHouseBusiness: {
            columnName: 'in_house_business',
            type: 'boolean',
            defaultsTo: false,
            columnType: 'boolean default false not null'
        },

        ratings: {
            collection: 'accountRating',
            via: 'accountId',
        },
        states: {
            collection: 'states',
            via: 'account',
            through: 'accountstate'
        }
    }
};
