const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart
router.get('/', auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });
  res.json(cart.items);
});

// Add standard product
router.post('/add', auth, async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ msg: 'Product not found' });
  if (product.type !== 'standard') return res.status(400).json({ msg: 'Use /add-variable for this product' });

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });

  const existing = cart.items.find(i => i.productId.toString() === productId && !i.variant);
  if (existing) existing.quantity += quantity;
  else {
    cart.items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      unit: product.unit
    });
  }
  await cart.save();
  res.json(cart.items);
});

// Add variable product (HDPE)
router.post('/add-variable', auth, async (req, res) => {
  const { productId, variant, meters } = req.body;
  const product = await Product.findById(productId);
  if (!product || product.type !== 'variable') return res.status(404).json({ msg: 'Invalid product' });

  const variantData = product.variants.find(v => v.diameter === variant.diameter && v.pressure === variant.pressure);
  if (!variantData) return res.status(404).json({ msg: 'Variant not found' });

  const pricePerMeter = variantData.priceTTC;

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });

  const existing = cart.items.find(i =>
    i.productId.toString() === productId &&
    i.variant?.diameter === variant.diameter &&
    i.variant?.pressure === variant.pressure
  );
  if (existing) existing.quantity += meters;
  else {
    cart.items.push({
      productId: product._id,
      name: `${product.name} (${variant.diameter}, ${variant.pressure})`,
      variant: { diameter: variant.diameter, pressure: variant.pressure },
      pricePerMeter,
      quantity: meters,
      unit: 'meter'
    });
  }
  await cart.save();
  res.json(cart.items);
});

// Update quantity
router.put('/update/:itemIndex', auth, async (req, res) => {
  const { quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ msg: 'Cart not found' });
  const idx = parseInt(req.params.itemIndex);
  if (idx < 0 || idx >= cart.items.length) return res.status(404).json({ msg: 'Item not found' });
  if (quantity <= 0) cart.items.splice(idx, 1);
  else cart.items[idx].quantity = quantity;
  await cart.save();
  res.json(cart.items);
});

// Remove item
router.delete('/remove/:itemIndex', auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ msg: 'Cart not found' });
  const idx = parseInt(req.params.itemIndex);
  if (idx < 0 || idx >= cart.items.length) return res.status(404).json({ msg: 'Item not found' });
  cart.items.splice(idx, 1);
  await cart.save();
  res.json(cart.items);
});

module.exports = router;