export const PaymentModel = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },

      billId: { 
        type: DataTypes.UUID,  // matches bills.id
        allowNull: false,
        field: 'bill_id',
        references: {
          model: 'bills', // table name
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      amountPaid: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
        field: 'amount_paid'
      },

      paymentDate: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW,
        field: 'payment_date'
      },

      method: {
        type: DataTypes.ENUM('cash', 'card', 'insurance', 'transfer'),
        allowNull: false,
      },

      reference: { 
        type: DataTypes.STRING, 
        allowNull: true 
      },
    },
    { 
      tableName: 'payments', 
      timestamps: true,
      underscored: true, // maps camelCase JS -> snake_case DB
    }
  );

  return Payment;
};
