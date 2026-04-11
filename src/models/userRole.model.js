/**
 * USER-ROLE JOIN TABLE
 * Links staff members to one or more functional roles.
 * This is the final link in the RBAC chain.
 */
export const UserRoleModel = (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    'UserRole',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      /**
       * FOREIGN KEY: USER
       */
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },

      /**
       * FOREIGN KEY: ROLE
       */
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'role_id',
        references: { model: 'roles', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'user_roles',
      underscored: true,
      // Lightweight join table; auditing is handled in separate logs
      timestamps: false,
      indexes: [
        { 
          unique: true, 
          fields: ['user_id', 'role_id'] 
        }
      ],
    }
  );

  return UserRole;
};