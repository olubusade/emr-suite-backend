export const BillModel = (sequelize, DataTypes) => {
  const Bill = sequelize.define(
    'Bill',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

      patientId: { type: DataTypes.UUID, allowNull: false, field: 'patient_id' },

      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

      status: {
        type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid', 'cancelled'),
        defaultValue: 'unpaid',
      },

      dueDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'due_date' },

      paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'insurance', 'transfer'),
        allowNull: true,
        field: 'payment_method',
      },

      notes: { type: DataTypes.TEXT, allowNull: true },

      createdBy: { type: DataTypes.UUID, allowNull: false, field: 'created_by' },
    },
    {
      tableName: 'bills',
      timestamps: true,
      underscored: true, // maps camelCase JS -> snake_case DB
    }
  );

  return Bill;
};
