export const UserPermissionModel = (sequelize, DataTypes) => {
  const UserPermission = sequelize.define('UserPermission', {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
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
  }, { 
    tableName: 'user_permissions', 
    underscored: true, 
    timestamps: false,
    indexes: [
      { unique: true, fields: ['user_id', 'permission_id'] }, // prevent duplicates
    ],
  });

  UserPermission.associate = (models) => {
    UserPermission.belongsTo(models.User, { 
      foreignKey: 'user_id', 
      as: 'user' 
    });
    UserPermission.belongsTo(models.Permission, { 
      foreignKey: 'permission_id', 
      as: 'permission' 
    });
  };

  return UserPermission;
};
