const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ msg: 'Cart is empty' });
  }

  const line_items = cart.items.map(item => {
    if (item.unit === 'meter') {
      const unitAmount = Math.round(item.pricePerMeter * 100); // Stripe uses cents, but we keep as integer for DZD
      return {
        price_data: {
          currency: 'dzd',
          product_data: { name: item.name },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    } else {
      const unitAmount = Math.round(item.price * 100);
      return {
        price_data: {
          currency: 'dzd',
          product_data: { name: item.name },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    }
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/shop.html`,
    metadata: { userId: req.user.id }
  });

  // Save order as pending
  const total = cart.items.reduce((sum, i) => {
    if (i.unit === 'meter') return sum + (i.pricePerMeter * i.quantity);
    else return sum + (i.price * i.quantity);
  }, 0);

  const order = new Order({
    user: req.user.id,
    items: cart.items.map(i => ({
      productId: i.productId,
      name: i.name,
      variant: i.variant,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unit === 'meter' ? i.pricePerMeter : i.price,
      totalPrice: i.unit === 'meter' ? i.pricePerMeter * i.quantity : i.price * i.quantity
    })),
    totalAmount: total,
    stripePaymentIntentId: session.payment_intent,
    status: 'pending'
  });
  await order.save();

  res.json({ url: session.url });
});

// Webhook (commented out for simplicity, add if needed)
/*
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = await Order.findOne({ stripePaymentIntentId: session.payment_intent });
    if (order) { order.status = 'paid'; await order.save(); }
    await Cart.findOneAndUpdate({ user: session.metadata.userId }, { items: [] });
  }
  res.json({ received: true });
});
*/

module.exports = router;