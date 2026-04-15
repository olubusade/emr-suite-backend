/**
 * BILL MODEL
 * Manages the financial obligations linked to clinical appointments.
 * Integrates with the Appointment state machine to trigger billing 
 * upon completion of consultation.
 */
export const BillModel = (sequelize, DataTypes) => {
  const Bill = sequelize.define(
    'Bill',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },
      appointmentId: { 
        type: DataTypes.UUID, 
        allowNull: false, 
        field: 'appointment_id',
        references: { model: 'appointments', key: 'id' }
      },
      patientId: { 
        type: DataTypes.UUID, 
        allowNull: false, 
        field: 'patient_id',
        references: { model: 'patients', key: 'id' }
      },
      /**
       * TRANSACTIONAL DATA
       * Decimal type ensures no floating-point rounding errors for currency.
       */
      amount: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
      },
      status: {
        type: DataTypes.ENUM('unpaid', 'pending', 'partially_paid', 'paid', 'cancelled'),
        defaultValue: 'unpaid',
      },
      dueDate: { 
        type: DataTypes.DATEONLY, 
        allowNull: true, 
        field: 'due_date' 
      },
      /**
       * PAYMENT LOGISTICS
       * Identifies the revenue stream (Direct Cash vs Insurance Claim).
       */
      paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'insurance', 'transfer'),
        allowNull: true,
        field: 'payment_method',
      },
      notes: { 
        type: DataTypes.TEXT, 
        allowNull: true 
      },
      createdBy: { 
        type: DataTypes.UUID, 
        allowNull: false, 
        field: 'created_by',
        references: { model: 'users', key: 'id' }
      },
    },
    {
      tableName: 'bills',
      timestamps: true,
      underscored: true,
    }
  );

  return Bill;
};