export const RoleModel = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    'Role',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },
      name: {
        type: DataTypes.ENUM(
          'super_admin',
          'admin',
          'doctor',
          'nurse',
          'receptionist',
          'lab_technician',
          'biller',
          'patient',
          'pharmacist'
        ),
        allowNull: false,
        unique: true,
      },
      description: { 
        type: DataTypes.STRING, 
        allowNull: true 
      },
    },
    { 
      tableName: 'roles', 
      underscored: true, 
      timestamps: true 
    }
  );

  return Role;
};
