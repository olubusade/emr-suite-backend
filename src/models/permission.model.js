export const PermissionModel = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    'Permission',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },
      name: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
      },
      description: { 
        type: DataTypes.STRING, 
        allowNull: true 
      }
    },
    { 
      tableName: 'permissions', 
      underscored: true, 
      timestamps: true 
    }
  );

  Permission.associate = (models) => {
    // Example associations (if needed):
    // Permission.belongsToMany(models.Role, {
    //   through: 'role_permissions',
    //   foreignKey: 'permission_id',
    //   otherKey: 'role_id',
    //   as: 'roles'
    // });
  };

  return Permission;
};
