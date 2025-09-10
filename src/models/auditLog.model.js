// apps/backend/src/models/audit_log.model.js
export const AuditLogModel = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true // null if system action
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      entity: {
        type: DataTypes.STRING,
        allowNull: false // e.g. "patient"
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: true
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      tableName: "audit_logs",
      timestamps: true
    }
  );


  return AuditLog;
};
