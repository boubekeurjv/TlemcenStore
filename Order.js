const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    variant: {
      diameter: String,
      pressure: String
    },
    quantity: Number,
    unit: String,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  stripePaymentIntentId: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);