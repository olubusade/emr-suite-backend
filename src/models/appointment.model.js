"use strict";
module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define("Appointment", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId: { type: DataTypes.UUID, allowNull: false },
    staffId: { type: DataTypes.UUID, allowNull: false },
    appointmentDate: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM("scheduled", "completed", "canceled"), defaultValue: "scheduled" }
  }, {});
  
  Appointment.associate = (models) => {
    Appointment.belongsTo(models.Patient, { foreignKey: "patientId" });
    Appointment.belongsTo(models.Staff, { foreignKey: "staffId" });
  };

  return Appointment;
};
