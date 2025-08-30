export default (sequelize, DataTypes) => {
    const Permission = sequelize.define('Permission', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, unique: true, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: true }
    }, { tableName: 'permissions', underscored: true, timestamps: true });
    return Permission;
  };
  