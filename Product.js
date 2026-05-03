const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  diameter: { type: String, required: true },
  pressure: { type: String, required: true },
  thickness: Number,
  weight: Number,
  priceHT: Number,
  priceTTC: Number
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['standard', 'variable'], default: 'standard' },
  price: Number,
  icon: String,
  desc: String,
  unit: { type: String, default: 'piece' },
  variants: [VariantSchema],
  inStock: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', ProductSchema);