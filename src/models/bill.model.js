export const BillModel = (sequelize, DataTypes) => {
  const Bill = sequelize.define(
    'Bill',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      patient_id: { type: DataTypes.UUID, allowNull: false }, // UUID now
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: {
        type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid', 'cancelled'),
        defaultValue: 'unpaid'
      },
      due_date: { type: DataTypes.DATEONLY, allowNull: true },
      payment_method: {
        type: DataTypes.ENUM('cash', 'card', 'insurance', 'transfer'),
        allowNull: true
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_by: { type: DataTypes.UUID, allowNull: false } // UUID
    },
    {
      tableName: 'bills',
      timestamps: true,
      underscored: true
    }
  );

  return Bill;
};
