/**
 * USER-PERMISSION JOIN TABLE
 * Facilitates "Direct Permission Assignment."
 * Used to grant specific capabilities to a user that fall outside 
 * of their standard assigned Role.
 */
export const UserPermissionModel = (sequelize, DataTypes) => {
  const UserPermission = sequelize.define(
    'UserPermission',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },

      /**
       * FOREIGN KEY: USER (Staff)
       */
      userId: { 
        type: DataTypes.UUID, 
        allowNull: false,
        field: 'user_id',
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },

      /**
       * FOREIGN KEY: PERMISSION
       */
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
      underscored: true, 
      timestamps: false,
      indexes: [
        { 
          // Prevents duplicate direct assignments
          unique: true, 
          fields: ['user_id', 'permission_id'] 
        }
      ],
    }
  );

  return UserPermission;
};