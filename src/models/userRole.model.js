// models/userRole.js
export const UserRoleModel = (sequelize, DataTypes) => {
    const UserRole = sequelize.define(
      'UserRole',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
  
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id',
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
  
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
        underscored: true, // maps camelCase JS -> snake_case DB
        timestamps: false,
        indexes: [{ unique: true, fields: ['user_id', 'role_id'] }],
      }
    );
  
    return UserRole;
  };
  