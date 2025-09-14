
export const VitalModel = (sequelize, DataTypes) => {
    const Vital = sequelize.define(
      'Vital',
      {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        patientId: { type: DataTypes.UUID, allowNull: false, field: 'patient_id' },
        nurseId: { type: DataTypes.UUID, allowNull: false, field: 'nurse_id' },
        temperature: { type: DataTypes.FLOAT },
        heartRate: { type: DataTypes.INTEGER },
        bloodPressure: { type: DataTypes.STRING },
        respiratoryRate: { type: DataTypes.INTEGER },
        notes: { type: DataTypes.TEXT }
      },
      { tableName: 'vitals', underscored: true, timestamps: true }
    );
    return Vital;
  };
  