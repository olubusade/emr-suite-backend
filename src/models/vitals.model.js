export const VitalModel = (sequelize, DataTypes) => {
    const Vital = sequelize.define(
      'Vital',
      {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        appointmentId: { 
        type: DataTypes.UUID, 
        allowNull: false, // Every vital reading should belong to a specific visit
        field: 'appointment_id',
        references: {
          model: 'appointments',
          key: 'id'
        }
      },
        patientId: { type: DataTypes.UUID, allowNull: false, field: 'patient_id' },
        nurseId: { type: DataTypes.UUID, allowNull: false, field: 'nurse_id' },
        
        // Helps distinguish between multiple readings taken on the same day.
        readingAt: { type: DataTypes.DATE, allowNull: false, field: 'reading_at' },

        temperature: { type: DataTypes.FLOAT },
        heartRate: { type: DataTypes.INTEGER },
        
        // Blood Pressure is fine as STRING, but let's add context
        bloodPressure: { type: DataTypes.STRING(20), comment: 'Systolic/Diastolic (e.g., 120/80)' }, 
        
        respiratoryRate: { type: DataTypes.INTEGER },
        weightKg: { type: DataTypes.FLOAT, field: 'weight_kg' },
        heightCm: { type: DataTypes.FLOAT, field: 'height_cm' },
        bmi: { type: DataTypes.FLOAT },
        spo2: { type: DataTypes.INTEGER, comment: 'Oxygen Saturation Percentage' },
        
        painScale: {
          type: DataTypes.INTEGER,
          validate: { min: 0, max: 10 },
          comment: '0 to 10 scale'
        }, // 0=none, 10=worst

        notes: { type: DataTypes.TEXT },
        createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "created_by",
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "updated_by",
        references: {
          model: 'users',
          key: 'id'
        }
      }
      },
      { 
        tableName: 'vitals', 
        underscored: true, 
        timestamps: true,
        indexes: [
          { fields: ['patient_id', 'reading_at', 'appointment_id'] },
        ]
      }
    );
    return Vital;
};