export const AuditLogModel = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      entity: {
        type: DataTypes.STRING,
        allowNull: false
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'entity_id'
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'ip_address'
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'user_agent'
      },
      details: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'details'
      }
    },
    {
      tableName: "audit_logs",
      timestamps: true
    }
  );

  return AuditLog;
};
