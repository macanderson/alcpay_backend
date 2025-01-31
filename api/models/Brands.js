module.exports = {
    tableName: 'brands',
    attributes: {
        brandName: {
            columnName: 'brand_name',
            type: 'string',
            columnType: 'varchar(128) NOT NULL',
        },
        encrypted_details: {
            columnName: 'encrypted_details',
            type: 'string',
            columnType: 'varchar(1024) NOT NULL',
        },
        storeName: {
            columnName: 'store_name',
            type: 'string',
            columnType: 'varchar(128) NOT NULL',
        },
        website: {
            columnName: 'website',
            type: 'string',
            columnType: 'varchar(128) NOT NULL',
        },
        accountId: {
            columnName: 'account_id',
            type: 'string',
            columnType: 'varchar(128) not null'
        },
        commission: {
            columnName: 'commission',
            type: 'string',
            columnType: 'varchar(128) default 10 NOT NULL',
        },
        user: {
            model: 'user',
            columnName: 'user_id',
            unique: true
        },
    }
};
