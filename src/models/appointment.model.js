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
        field: "patient_id", // snake_case in DB
      },
      staffId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "staff_id", // snake_case in DB
      },
      appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "appointment_date", // snake_case in DB
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("scheduled", "completed", "canceled", "no_show"),
        defaultValue: "scheduled",
      },
    },
    {
      tableName: "appointments",
      underscored: true, // automatically maps camelCase JS -> snake_case DB
      timestamps: true,
    }
  );

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.Patient, {
      foreignKey: "patientId",
      as: "patient", // optional alias for cleaner queries
    });

    Appointment.belongsTo(models.Staff, {
      foreignKey: "staffId",
      as: "staff", // optional alias
    });
  };

  return Appointment;
};
