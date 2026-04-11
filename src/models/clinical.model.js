/**
 * CLINICAL NOTE MODEL
 * Represents the primary documentation of a medical encounter.
 * Follows the standardized SOAP note format used globally by healthcare providers.
 */
export const ClinicalNoteModel = (sequelize, DataTypes) => {
    const ClinicalNote = sequelize.define(
      'ClinicalNote',
      {
        id: { 
          type: DataTypes.UUID, 
          defaultValue: DataTypes.UUIDV4, 
          primaryKey: true 
        },
        patientId: { 
          type: DataTypes.UUID, 
          allowNull: false, 
          field: 'patient_id',
          references: { model: 'patients', key: 'id' }
        },
        staffId: { 
          type: DataTypes.UUID, 
          allowNull: false, 
          field: 'staff_id',
          references: { model: 'users', key: 'id' }
        },
        appointmentId: { 
          type: DataTypes.UUID, 
          allowNull: false, 
          field: 'appointment_id',
          unique: true, // Typically one definitive note per appointment
          references: { model: 'appointments', key: 'id' }
        },
        
        /**
         * CLINICAL CONTENT
         * Primary diagnosis and the four pillars of medical documentation (SOAP).
         */
        diagnosis: { 
            type: DataTypes.TEXT, 
            allowNull: true,
            comment: 'Primary diagnosis or ICD-10 code for this clinical encounter'
        },

        subjective: { 
          type: DataTypes.TEXT, 
          allowNull: true,
          comment: 'Patient symptoms and history provided verbally' 
        },
        objective: { 
          type: DataTypes.TEXT, 
          allowNull: true,
          comment: 'Measurable findings from physical exam and vitals'
        },
        assessment: { 
          type: DataTypes.TEXT, 
          allowNull: true,
          comment: 'The clinical interpretation and diagnosis rationale'
        },
        plan: { 
          type: DataTypes.TEXT, 
          allowNull: true, 
          comment: 'The treatment roadmap, prescriptions, and follow-ups'
        },

        createdBy: {
          type: DataTypes.UUID,
          allowNull: false,
          field: "created_by",
          references: { model: 'users', key: 'id' }
        },
        updatedBy: {
          type: DataTypes.UUID,
          allowNull: true,
          field: "updated_by",
          references: { model: 'users', key: 'id' }
        }
      },
      { 
        tableName: 'clinical_notes', 
        underscored: true, 
        timestamps: true,
        indexes: [
          { fields: ['patient_id'] },
          { fields: ['appointment_id'] },
          { fields: ['staff_id'] },
        ]
      }
    );
  
    return ClinicalNote;
  };