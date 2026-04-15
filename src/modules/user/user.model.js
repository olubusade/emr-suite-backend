/**
 * USER MODEL (Staff)
 * The central identity record for hospital employees.
 * Links to Roles and Permissions to define system access levels.
 */
export const UserModel = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      /**
       * DEMOGRAPHICS
       */
      fName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'fname',
      },
      lName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'lname',
      },
      fullName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'full_name'
      },
      /**
       * AUTHENTICATION
       */
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
      },
      /**
       * SESSION TRACKING
       * Essential for security audits and detecting ghost accounts.
       */
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
      },
      /**
       * PROFESSIONAL CONTEXT
       * e.g., 'Consultant Cardiologist', 'Senior Matron', 'Accountant'
       */
      designation: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      /**
       * ACCOUNT STATUS
       * Used for instant revocation of access without deleting data.
       */
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true,
      indexes: [{ unique: true, fields: ['email'] }],
      
      /**
       * HOOKS
       * Automates data sanitization before persistence.
       */
      hooks: {
        beforeValidate: (user) => {
          if (user.fName && user.lName) {
            user.fullName = `${user.fName} ${user.lName}`;
          }
          if (user.email) {
            user.email = user.email.toLowerCase().trim();
          }
        }
      }
    }
  );

  return User;
};