export default (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, unique: true, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: true }
    }, { tableName: 'roles', underscored: true, timestamps: true });
    return Role;
  };
  