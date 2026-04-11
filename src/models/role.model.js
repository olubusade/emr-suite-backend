/**
 * ROLE MODEL
 * Defines the functional categories of users in the EMR.
 * Serves as the middle layer between Users and Permissions (RBAC).
 */
export const RoleModel = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    'Role',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },
      /**
       * STANDARDIZED ROLE NAMES
       * Maps directly to the ROLES constant. 
       * Using an ENUM ensures data consistency at the DB level.
       */
      name: {
        type: DataTypes.ENUM(
          'super_admin',
          'admin',
          'doctor',
          'nurse',
          'receptionist',
          'patient',
        ),
        allowNull: false,
        unique: true
      },
      description: { 
        type: DataTypes.STRING, 
        allowNull: true,
        comment: 'High-level summary of what this role represents'
      },
    },
    { 
      tableName: 'roles', 
      underscored: true, 
      timestamps: true,
      indexes: [
        { fields: ['name'] }
      ]
    }
  );

  return Role;
};