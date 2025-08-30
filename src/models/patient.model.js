module.exports = (sequelize, DataTypes) => {
    const Patient = sequelize.define('Patient', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      dob: { type: DataTypes.DATEONLY, allowNull: true },
      gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.STRING, allowNull: true },
    }, { tableName: 'patients', timestamps: true });
  
    Patient.associate = (models) => {
      Patient.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    };
  
    return Patient;
  };
  