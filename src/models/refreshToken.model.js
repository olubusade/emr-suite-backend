import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';
import { User } from './index.js';

export const RefreshTokenModel = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' }, // <-- UUID
    token: { type: DataTypes.STRING, allowNull: false },
    tokenHash: { type: DataTypes.STRING, allowNull: false, field: 'token_hash' },
    expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
    revokedAt: { type: DataTypes.DATE, allowNull: true, field: 'revoked_at' },
    replacedByToken: { type: DataTypes.STRING, allowNull: true, field: 'replaced_by_token' },
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true
  });

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return RefreshToken;
};
