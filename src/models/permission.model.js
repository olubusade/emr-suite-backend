export const PermissionModel = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    'Permission',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },
      key: { type: DataTypes.STRING, allowNull: false, unique: true },
      name: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
      },
      description: { 
        type: DataTypes.STRING, 
        allowNull: true 
      },
    },
    { 
      tableName: 'permissions', 
      underscored: true, 
      timestamps: true 
    }
  );

  return Permission;
};
