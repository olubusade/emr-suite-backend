export const BTGRequestModel = (sequelize, DataTypes) => {
  const BTGRequest = sequelize.define('BTGRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    patientId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    clinicalNoteId: {
      type: DataTypes.UUID,
      allowNull: true  // Optional link to a clinical note that triggered the request, it's for future use if we want to link BTG requests to specific clinical notes
    },
    requestedBy: {
      type: DataTypes.UUID,
      allowNull: false
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED','EXPIRED','REVOKED'),
      defaultValue: 'PENDING'
    },

    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
     decisionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Justification provided by the Auditor/Admin for the decision'
    },

    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectedAt: {
      type:  DataTypes.DATE,
      format: 'date-time'
    },

    revokedAt: {
      type:  DataTypes.DATE,
      format: 'date-time'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    }
    
  });

  return BTGRequest;
};