module.exports = {
  tableName: 'location_map',
  attributes: {
    zipMin: {
      columnName: 'zip_min',
      type: 'number'
    },
    zipMax: {
      columnName: 'zip_max',
      type: 'number'
    },
    locationId:{
      columnName: 'location_id',
      type: 'string',
      columnType:  'varchar(64) not null'
    }
  }
}
