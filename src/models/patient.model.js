export const PatientModel = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    'Patient',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // auto-generate UUID
        primaryKey: true,
        field: 'id'
      },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      dob: { type: DataTypes.DATEONLY, allowNull: false },
      gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: false },
      marital_status: { type: DataTypes.ENUM('single', 'married'), allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      address: { type: DataTypes.STRING, allowNull: true },
      profile_image: { type: DataTypes.STRING, allowNull: true }
    },
    {
      tableName: 'patients',
      timestamps: true,
      underscored: true,
      getterMethods: {
        fullName() {
          return `${this.first_name} ${this.last_name}`;
        }
      }
    }
  );

  Patient.associate = (models) => {
    Patient.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Patient.hasMany(models.Bill, { foreignKey: 'patient_id', as: 'bills' });
    Patient.hasMany(models.Appointment, { foreignKey: 'patient_id', as: 'appointments' });
  };

  return Patient;
};
