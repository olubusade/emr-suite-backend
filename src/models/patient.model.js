export const PatientModel = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    'Patient',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // auto-generate UUID
        primaryKey: true,
        field: 'id',
      },

      firstName: { type: DataTypes.STRING, allowNull: false, field: 'first_name' },

      lastName: { type: DataTypes.STRING, allowNull: false, field: 'last_name' },

      dob: { type: DataTypes.DATEONLY, allowNull: false },

      gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: false },

      maritalStatus: { type: DataTypes.ENUM('single', 'married'), allowNull: false, field: 'marital_status' },

      phone: { type: DataTypes.STRING, allowNull: true },

      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },

      address: { type: DataTypes.STRING, allowNull: true },

      profileImage: { type: DataTypes.STRING, allowNull: true, field: 'profile_image' },
    },
    {
      tableName: 'patients',
      timestamps: true,
      underscored: true,
      getterMethods: {
        fullName() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    }
  );

  return Patient;
};
