/**
 * REFRESH TOKEN MODEL
 * Manages long-lived sessions and security rotation.
 * Ensures that even if an Access Token is compromised, 
 * the session can be revoked or rotated securely.
 */
export const RefreshTokenModel = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    /**
     * OWNER OF THE SESSION
     * Links to either a Staff User or a Patient.
     */
    userId: { 
      type: DataTypes.UUID, 
      allowNull: false, 
      field: 'user_id' 
    },
    /**
     * TOKEN IDENTIFIERS
     * 'token' is the identifier; 'tokenHash' is the cryptographically 
     * secure version stored for verification.
     */
    token: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    tokenHash: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      field: 'token_hash' 
    },
    /**
     * LIFECYCLE MANAGEMENT
     */
    expiresAt: { 
      type: DataTypes.DATE, 
      allowNull: false, 
      field: 'expires_at' 
    },
    revokedAt: { 
      type: DataTypes.DATE, 
      allowNull: true, 
      field: 'revoked_at' 
    },
    /**
     * REFRESH TOKEN ROTATION
     * Tracks the 'New' token that replaced this one to detect 
     * 'Token Reuse' (Replay Attacks).
     */
    replacedByToken: { 
      type: DataTypes.STRING, 
      allowNull: true, 
      field: 'replaced_by_token' 
    },
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['token'], unique: true }
    ]
  });

  /**
   * VIRTUAL CHECK: IS EXPIRED
   */
  RefreshToken.prototype.isExpired = function() {
    return new Date() >= this.expiresAt;
  };

  /**
   * VIRTUAL CHECK: IS ACTIVE
   */
  RefreshToken.prototype.isActive = function() {
    return !this.revokedAt && !this.isExpired();
  };

  return RefreshToken;
};