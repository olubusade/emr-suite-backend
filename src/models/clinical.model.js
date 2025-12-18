export const ClinicalNoteModel = (sequelize, DataTypes) => {
    const ClinicalNote = sequelize.define(
      'ClinicalNote',
      {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        patientId: { type: DataTypes.UUID, allowNull: false, field: 'patient_id' },
        staffId: { type: DataTypes.UUID, allowNull: false, field: 'staff_id' },
        
        // 🔑 NEW FIELD: Diagnosis
        diagnosis: { 
            type: DataTypes.TEXT, 
            allowNull: true,
            comment: 'Primary diagnosis/ICD code for this clinical encounter'
        },

        subjective: { type: DataTypes.TEXT, allowNull: true },
        objective: { type: DataTypes.TEXT, allowNull: true },
        assessment: { type: DataTypes.TEXT, allowNull: true },
        plan: { type: DataTypes.TEXT, allowNull: true }
      },
      { 
        tableName: 'clinical_notes', 
        underscored: true, 
        timestamps: true,
        // Optional: Add index for faster lookup by patient/staff
        indexes: [
            { fields: ['patient_id'] },
            { fields: ['staff_id'] },
        ]
      }
    );
  
    return ClinicalNote;
  };