/**
 * PERMISSION MODEL
 * Defines the granular capabilities within the EMR system.
 * These are mapped to Roles to create a flexible, scalable 
 * access control matrix.
 */
export const PermissionModel = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    'Permission',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },
      /**
       * UNIQUE IDENTIFIER (e.g., 'PATIENT_READ', 'BILL_CREATE')
       * Used in code for middleware checks: if(user.hasPermission('PATIENT_READ'))
       */
      key: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
      },
      /**
       * HUMAN-READABLE NAME (e.g., 'View Patient Records')
       * Displayed in the Admin Dashboard when managing roles.
       */
      name: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
      },
      description: { 
        type: DataTypes.STRING, 
        allowNull: true,
        comment: 'Explains exactly what this permission allows for audit purposes'
      },
    },
    { 
      tableName: 'permissions', 
      underscored: true, 
      timestamps: true,
      indexes: [
        { fields: ['key'] }
      ]
    }
  );

  return Permission;
};