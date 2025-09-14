export const RolePermissionModel = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    'RolePermission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'role_id',
        references: { model: 'roles', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      permissionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'permission_id',
        references: { model: 'permissions', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      tableName: 'role_permissions',
      underscored: true, // maps camelCase JS -> snake_case DB
      timestamps: false,
    }
  );

  return RolePermission;
};
