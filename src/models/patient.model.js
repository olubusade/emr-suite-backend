import { Op } from 'sequelize';
export const PatientModel = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    'Patient',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      firstName: { type: DataTypes.STRING(100), allowNull: false, field: 'first_name' },
      lastName: { type: DataTypes.STRING(100), allowNull: false, field: 'last_name' },
      middleName: { type: DataTypes.STRING(100), allowNull: true, field: 'middle_name' },

      password: { type: DataTypes.STRING(255), allowNull: false, comment: 'Hashed password for portal access' },
      role: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'patient' }, // Required for RBAC

      dob: { type: DataTypes.DATEONLY, allowNull: false },
      gender: { type: DataTypes.ENUM('male', 'female', 'other', 'unknown'), allowNull: false, defaultValue: 'unknown' },

      maritalStatus: {
        type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed', 'separated'),
        allowNull: true,
        field: 'marital_status'
      },

      phone: { type: DataTypes.STRING(20), allowNull: true, unique: true }, // Add length and uniqueness
      email: {
        type: DataTypes.STRING(100), // Add length
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },

      //COMPLIANCE & UNIQUE ID
      nationalId: { type: DataTypes.STRING(50), allowNull: true, unique: true, field: 'national_id' },

      address: { type: DataTypes.STRING(255), allowNull: true },
      occupation: { type: DataTypes.STRING(100), allowNull: true },
      nationality: { type: DataTypes.STRING(100), allowNull: true },
      stateOfOrigin: { type: DataTypes.STRING(100), allowNull: true, field: 'state_of_origin' },

      bloodGroup: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        allowNull: true,
        field: 'blood_group',
      },
      genotype: { type: DataTypes.ENUM('AA', 'AS', 'SS', 'AC', 'SC'), allowNull: true },

      // Emergency Contact (Add relationship for completeness)
      emergencyContactName: { type: DataTypes.STRING(100), allowNull: true, field: 'emergency_contact_name' },
      emergencyContactPhone: { type: DataTypes.STRING(20), allowNull: true, field: 'emergency_contact_phone' },
      emergencyRelationship: { type: DataTypes.STRING(50), allowNull: true, field: 'emergency_relationship' },

      profileImage: { type: DataTypes.STRING(500), allowNull: true, field: 'profile_image' },

      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deceased', 'suspended'),
        defaultValue: 'active',
      },
      mustChangePassword: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'must_change_password' },

      // AUDIT FIELD
      createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    },
    {
      tableName: 'patients',
      timestamps: true,
      underscored: true,

      indexes: [
        { fields: ['email'], unique: true },
        {
          fields: ['national_id'], unique: true,
          where: { national_id: { [Op.ne]: null } }
        },
        { fields: ['last_name', 'dob'] }, // Better search index
        { fields: ['created_by'] },
      ],

      getterMethods: {
        fullName() {
          // Include middle name if it exists
          return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
        },
      },
      
      // Hooks (Hashing and Auditing logic goes in the Service/Controller)
      beforeCreate: (patient) => {
          if (patient.email) patient.email = patient.email.toLowerCase();
      },
    }
  );

  return Patient;
};