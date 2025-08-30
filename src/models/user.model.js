export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      fname: { type: DataTypes.STRING, allowNull: false },
      lname: { type: DataTypes.STRING, allowNull: false },
      full_name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password_hash: { type: DataTypes.STRING, allowNull: false },
      designation: { type: DataTypes.STRING, allowNull: true },
      active: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { tableName: 'users', underscored: true, timestamps: true });
    return User;
  };
  