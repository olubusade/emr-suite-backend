module.exports = (sequelize, DataTypes) => {
    const UserPermission = sequelize.define('UserPermission', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      permissionId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'user_permissions', timestamps: false });
  
    UserPermission.associate = (models) => {
      UserPermission.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      UserPermission.belongsTo(models.Permission, { foreignKey: 'permissionId', as: 'permission' });
    };
  
    return UserPermission;
  };
  