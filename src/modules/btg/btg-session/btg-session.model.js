export const BTGSessionModel = (sequelize, DataTypes) => {
  const BTGSession = sequelize.define('BTGSession', {

    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    btgRequestId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    patientId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    userName: {
      type: DataTypes.STRING
    },

    role: {
      type: DataTypes.STRING
    },

    accessedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED'),
      defaultValue: 'ACTIVE'
    },
    lastSeenAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'btg_sessions',
    timestamps: true
  });

  return BTGSession;
};