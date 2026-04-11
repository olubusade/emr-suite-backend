/**
 * ROLE-PERMISSION JOIN TABLE
 * Facilitates the Many-to-Many relationship between Roles and Permissions.
 * This is the core of the system's authorization logic.
 */
export const RolePermissionModel = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    'RolePermission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      /**
       * FOREIGN KEY: ROLE
       */
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'role_id',
        references: { 
          model: 'roles', 
          key: 'id' 
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      /**
       * FOREIGN KEY: PERMISSION
       */
      permissionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'permission_id',
        references: { 
          model: 'permissions', 
          key: 'id' 
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      tableName: 'role_permissions',
      underscored: true,
      // Timestamps are disabled here to keep the join table lightweight
      timestamps: false,
      indexes: [
        {
          // Prevents duplicate permission assignments to the same role
          unique: true,
          fields: ['role_id', 'permission_id']
        }
      ]
    }
  );

  return RolePermission;
};