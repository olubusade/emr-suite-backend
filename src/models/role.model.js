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
        unique: true
      },
      description: { 
        type: DataTypes.STRING, 
        allowNull: true 
      }
    },
    { 
      tableName: 'roles', 
      underscored: true, 
      timestamps: true 
    }
  );

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
    Role.belongsToMany(models.Permission, {
      through: 'role_permissions',
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions'
    });
  };

  return Role;
};
