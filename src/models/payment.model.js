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
        type: DataTypes.UUID,
        allowNull: false,
        field: 'bill_id',
        references: {
          model: 'bills',
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

      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'completed',
      },

      reference: { 
        type: DataTypes.STRING, 
        allowNull: true 
      },
    },
    { 
      tableName: 'payments', 
      timestamps: true,
      underscored: true,
    }
  );

  return Payment;
};