module.exports = {
    tableName: 'users',
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true,
            unique: true,
            columnName: 'id'
        },
        createdAt: {
            type: 'number',
            allowNull: true,
            columnName: 'createdAt'
        },
        updatedAt: {
            type: 'number',
            allowNull: true,
            columnName: 'updatedAt'
        },
        name: {
            type: 'string',
            maxLength: 128,
            defaultsTo: '',
            columnName: 'name'
        },
        email: {
            type: 'string',
            maxLength: 128,
            required: true,
            unique: true,
            columnName: 'email'
        },
        password: {
            type: 'string',
            maxLength: 255,
            required: true,
            columnName: 'password'
        },
        contact: {
            type: 'string',
            maxLength: 255,
            required: true,
            columnName: 'contact_number'
        },
        isActive: {
            type: 'boolean',
            defaultsTo: true,
            columnName: 'is_active'
        },
        roleId: {
            type: 'number',
            defaultsTo: 3,
            columnName: 'role_id'
        },
      brand: {
        collection:'brands',
        via: 'user'
      }
    },
    timestamps: true,
    schema: true
};
