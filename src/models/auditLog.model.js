module.exports = (sequelize, DataTypes) => {
    const AuditLog = sequelize.define('AuditLog', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: true }, // null if system action
      action: { type: DataTypes.STRING, allowNull: false },
      entity: { type: DataTypes.STRING, allowNull: false }, // e.g. "Patient"
      entityId: { type: DataTypes.INTEGER, allowNull: true },
      ipAddress: { type: DataTypes.STRING, allowNull: true },
      userAgent: { type: DataTypes.STRING, allowNull: true },
      details: { type: DataTypes.JSON, allowNull: true },
    }, { tableName: 'audit_logs', timestamps: true });
  
    AuditLog.associate = (models) => {
      AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };
  
    return AuditLog;
  };
  