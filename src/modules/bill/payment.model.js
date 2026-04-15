/**
 * PAYMENT MODEL
 * Records the actual movement of funds against a specific bill.
 * Supports partial payments and external transaction referencing.
 */
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
        /**
         * DATA INTEGRITY
         * If a bill is deleted (rare), the payment records should follow.
         */
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      /**
       * FINANCIAL DATA
       * Using DECIMAL to prevent floating-point errors.
       */
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

      /**
       * EXTERNAL TRACKING
       * Stores transaction IDs from Paystack, Flutterwave, or Bank USSD refs.
       */
      reference: { 
        type: DataTypes.STRING, 
        allowNull: true 
      },
    },
    { 
      tableName: 'payments', 
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['bill_id'] },
        { fields: ['reference'] }
      ]
    }
  );

  return Payment;
};