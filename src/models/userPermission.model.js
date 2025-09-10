export const UserPermissionModel = (sequelize, DataTypes) => {
  const UserPermission = sequelize.define(
    'UserPermission',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },
      user_id: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      permission_id: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'permissions', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    { 
      tableName: 'user_permissions', 
      underscored: true, 
      timestamps: false,
      indexes: [{ unique: true, fields: ['user_id', 'permission_id'] }],
    }
  );

  return UserPermission;
};
