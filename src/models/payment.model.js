export const PaymentModel = (sequelize, DataTypes) => {
    const Payment = sequelize.define(
      'Payment',
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        bill_id: { type: DataTypes.INTEGER, allowNull: false },
        amount_paid: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        payment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        method: {
          type: DataTypes.ENUM('cash', 'card', 'insurance', 'transfer'),
          allowNull: false,
        },
        reference: { type: DataTypes.STRING, allowNull: true },
      },
      { 
        tableName: 'payments', 
        timestamps: true,
        underscored: true // ensures Sequelize auto-generates snake_case foreign keys & timestamps
      }
    );
  
    Payment.associate = (models) => {
      Payment.belongsTo(models.Bill, { foreignKey: 'bill_id', as: 'bill' });
    };
  
    return Payment;
  };
  