/**
 * AUDIT LOG MODEL
 * The immutable record of all system activities.
 * Designed to meet medical data integrity standards (e.g., HIPAA/GDPR).
 */
export const AuditLogModel = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      // Example: 'CREATE_APPOINTMENT', 'UPDATE_VITAL'
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Example: 'appointment', 'patient', 'billing'
      entity: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // The actor performing the action
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      // The specific record ID affected
      entityId: {
        type: DataTypes.UUID, // Matching UUID type for consistency
        allowNull: true,
        field: 'entity_id'
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'ip_address'
      },
      forwardedFor: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'forwarded_for'
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'user_agent'
      },
      /**
       * STRUCTURED METADATA
       * Stores the 'Before' and 'After' states or specific payload data.
       * JSONB allows for high-performance indexing and querying in Postgres.
       */
      details: {
        type: DataTypes.JSONB,
        allowNull: true
      }
    },
    {
      tableName: "audit_logs",
      timestamps: true,
      // IMMUTABLE Audit logs should never be modified or updated (Read/Create only)
      updatedAt: false, 
      indexes: [
        { fields: ['action'] },
        { fields: ['entity'] },
        { fields: ['user_id'] },
        { fields: ['entity_id'] },
        { fields: ['created_at'] }
      ]
    }
  );

  return AuditLog;
};