import { Op } from 'sequelize';

/**
 * PATIENT MODEL
 * The central repository for demographic and clinical baseline data.
 * Designed for high searchability and strict data integrity.
 */
export const PatientModel = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    'Patient',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      /**
       * DEMOGRAPHICS
       */
      firstName: { type: DataTypes.STRING(100), allowNull: false, field: 'first_name' },
      lastName: { type: DataTypes.STRING(100), allowNull: false, field: 'last_name' },
      middleName: { type: DataTypes.STRING(100), allowNull: true, field: 'middle_name' },

      /**
       * SECURITY & AUTHENTICATION
       * Allows patients to log into the Crovix Patient Portal.
       */
      password: { type: DataTypes.STRING(255), allowNull: false, comment: 'Hashed password for portal access' },
      role: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'patient' }, 
      mustChangePassword: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'must_change_password' },

      dob: { type: DataTypes.DATEONLY, allowNull: false },
      gender: { type: DataTypes.ENUM('male', 'female', 'other', 'unknown'), allowNull: false, defaultValue: 'unknown' },

      maritalStatus: {
        type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed', 'separated'),
        allowNull: true,
        field: 'marital_status'
      },

      /**
       * CONTACT DETAILS
       */
      phone: { type: DataTypes.STRING(20), allowNull: true, unique: true },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      address: { type: DataTypes.STRING(255), allowNull: true },
      profileImage: { type: DataTypes.STRING(500), allowNull: true, field: 'profile_image' },

      /**
       * IDENTIFICATION & ORIGIN
       */
      nationalId: { type: DataTypes.STRING(50), allowNull: true, unique: true, field: 'national_id' },
      occupation: { type: DataTypes.STRING(100), allowNull: true },
      nationality: { type: DataTypes.STRING(100), allowNull: true },
      stateOfOrigin: { type: DataTypes.STRING(100), allowNull: true, field: 'state_of_origin' },

      /**
       * CLINICAL BASELINE
       */
      bloodGroup: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        allowNull: true,
        field: 'blood_group',
      },
      genotype: { type: DataTypes.ENUM('AA', 'AS', 'SS', 'AC', 'SC'), allowNull: true },

      /**
       * EMERGENCY CONTACT
       */
      emergencyContactName: { type: DataTypes.STRING(100), allowNull: true, field: 'emergency_contact_name' },
      emergencyContactPhone: { type: DataTypes.STRING(20), allowNull: true, field: 'emergency_contact_phone' },
      emergencyRelationship: { type: DataTypes.STRING(50), allowNull: true, field: 'emergency_relationship' },

      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deceased', 'suspended'),
        defaultValue: 'active',
      },

      createdBy: { 
        type: DataTypes.UUID, 
        allowNull: true, 
        field: 'created_by',
        references: { model: 'users', key: 'id' }
      },
    },
    {
      tableName: 'patients',
      timestamps: true,
      underscored: true,

      indexes: [
        { fields: ['email'], unique: true },
        /**
         * PARTIAL INDEX
         * Ensures uniqueness of National IDs only when they are not NULL.
         * Prevents multi-null constraint errors in PostgreSQL.
         */
        {
          fields: ['national_id'], 
          unique: true,
          where: { national_id: { [Op.ne]: null } }
        },
        { fields: ['last_name', 'dob'] }, 
        { fields: ['created_by'] },
      ],

      /**
       * HOOKS
       * Sanitizes data at the ORM level before it reaches the persistence layer.
       */
      hooks: {
        beforeCreate: (patient) => {
          if (patient.email) patient.email = patient.email.toLowerCase();
        },
        beforeUpdate: (patient) => {
          if (patient.email) patient.email = patient.email.toLowerCase();
        }
      }
    }
  );

  return Patient;
};