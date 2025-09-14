export const UserPermissionModel = (sequelize, DataTypes) => {
  const UserPermission = sequelize.define(
    'UserPermission',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },

      userId: { 
        type: DataTypes.UUID, 
        allowNull: false,
        field: 'user_id',
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },

      permissionId: { 
        type: DataTypes.UUID, 
        allowNull: false,
        field: 'permission_id',
        references: { model: 'permissions', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    { 
      tableName: 'user_permissions', 
      underscored: true, // maps camelCase JS -> snake_case DB
      timestamps: false,
      indexes: [{ unique: true, fields: ['user_id', 'permission_id'] }],
    }
  );

  return UserPermission;
};
