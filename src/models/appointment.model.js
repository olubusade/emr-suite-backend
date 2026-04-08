export const AppointmentModel = (sequelize, DataTypes) => {
  const Appointment = sequelize.define(
    "Appointment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "patient_id",
      },
      staffId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "staff_id",
      },
      appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "appointment_date"
      },
      appointmentTime: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "appointment_time",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "scheduled",      // Booked, not yet at the clinic
          "checked_in",     // Patient has arrived at the front desk
          "awaiting_vitals",   // Patient is waiting for vitals to be taken
          "vitals_taken",   // Nurse has finished, ready for Doctor
          "in_consultation",// Currently with the Doctor
          "completed",      // Doctor finished the note
          "canceled",       // No-show or canceled
        ),
        defaultValue: "scheduled",
      },
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
      tableName: "appointments",
      underscored: true, // automatically maps camelCase JS -> snake_case DB
      timestamps: true,
    }
  );

  return Appointment;
};
