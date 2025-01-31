module.exports = {
  tableName: 'states',
  attributes: {
    name: {
      type: 'string',
      columnName: 'name',
      columnType: 'varchar(64) not null'
    },
    code: {
      type: 'string',
      columnName: 'code',
      columnType: 'varchar(4) not null unique'
    },
    accounts: {
      collection: 'account',
      via: 'states',
      through: 'accountstate'
    }
  }
}
