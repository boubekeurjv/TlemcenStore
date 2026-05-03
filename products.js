const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// SEED endpoint – call POST /api/products/seed once
router.post('/seed', async (req, res) => {
  try {
    await Product.deleteMany();

    const margin = 1.15; // +15%

    // === بيانات PN10 كاملة (حسب الجدول المقدم) ===
    const pn10Data = [
      { diam: "20mm", press: "PN10", thick: 1.9, weight: 0.11, priceRef: 20.44 },
      { diam: "25mm", press: "PN10", thick: 2.0, weight: 0.14, priceRef: 26.02 },
      { diam: "32mm", press: "PN10", thick: 2.0, weight: 0.18, priceRef: 33.45 },
      { diam: "40mm", press: "PN10", thick: 2.4, weight: 0.29, priceRef: 94.92 },
      { diam: "50mm", press: "PN10", thick: 3.0, weight: 0.45, priceRef: 83.63 },
      { diam: "63mm", press: "PN10", thick: 3.8, weight: 0.71, priceRef: 131.95 },
      { diam: "75mm", press: "PN10", thick: 4.5, weight: 1.00, priceRef: 185.84 },
      { diam: "90mm", press: "PN10", thick: 5.4, weight: 1.44, priceRef: 444.22 },
      { diam: "110mm", press: "PN10", thick: 6.6, weight: 2.13, priceRef: 395.84 },
      { diam: "125mm", press: "PN10", thick: 7.4, weight: 2.71, priceRef: 503.63 },
      { diam: "160mm", press: "PN10", thick: 9.5, weight: 4.43, priceRef: 823.28 },
      { diam: "200mm", press: "PN10", thick: 11.9, weight: 6.88, priceRef: 2129.85 },
      { diam: "250mm", press: "PN10", thick: 14.8, weight: 10.64, priceRef: 1977.34 },
      { diam: "315mm", press: "PN10", thick: 18.7, weight: 16.86, priceRef: 3133.19 },
      { diam: "400mm", press: "PN10", thick: 23.7, weight: 27.03, priceRef: 5023.24 },
      { diam: "500mm", press: "PN10", thick: 29.7, weight: 42.14, priceRef: 7831.09 },
      { diam: "630mm", press: "PN10", thick: 37.4, weight: 66.65, priceRef: 12385.81 },
      { diam: "710mm", press: "PN10", thick: 42.1, weight: 84.44, priceRef: 15691.95 },
      { diam: "800mm", press: "PN10", thick: 47.4, weight: 106.77, priceRef: 19841.94 }
    ];

    // === بيانات PN16 كاملة ===
    const pn16Data = [
      { diam: "20mm", press: "PN16", thick: 2.0, weight: 0.11, priceRef: 20.44 },
      { diam: "25mm", press: "PN16", thick: 2.3, weight: 0.16, priceRef: 29.73 },
      { diam: "32mm", press: "PN16", thick: 3.0, weight: 0.27, priceRef: 50.18 },
      { diam: "40mm", press: "PN16", thick: 3.7, weight: 0.44, priceRef: 81.77 },
      { diam: "50mm", press: "PN16", thick: 4.6, weight: 0.68, priceRef: 126.37 },
      { diam: "63mm", press: "PN16", thick: 5.8, weight: 1.07, priceRef: 198.85 },
      { diam: "75mm", press: "PN16", thick: 6.8, weight: 1.48, priceRef: 275.04 },
      { diam: "90mm", press: "PN16", thick: 8.2, weight: 2.13, priceRef: 632.91 },
      { diam: "110mm", press: "PN16", thick: 10.0, weight: 3.17, priceRef: 589.11 },
      { diam: "125mm", press: "PN16", thick: 11.4, weight: 4.09, priceRef: 760.09 },
      { diam: "160mm", press: "PN16", thick: 14.6, weight: 6.71, priceRef: 1246.94 },
      { diam: "200mm", press: "PN16", thick: 18.2, weight: 10.33, priceRef: 3103.50 },
      { diam: "250mm", press: "PN16", thick: 22.7, weight: 16.04, priceRef: 2980.96 },
      { diam: "315mm", press: "PN16", thick: 28.6, weight: 25.36, priceRef: 4712.81 },
      { diam: "400mm", press: "PN16", thick: 36.3, weight: 40.61, priceRef: 7546.82 },
      { diam: "500mm", press: "PN16", thick: 45.4, weight: 63.17, priceRef: 11738.36 }
    ];

    const variants = [];

    pn10Data.forEach(item => {
      const ht = item.priceRef;
      const ttc = ht * margin;
      variants.push({
        diameter: item.diam,
        pressure: item.press,
        thickness: item.thick,
        weight: item.weight,
        priceHT: parseFloat(ht.toFixed(2)),
        priceTTC: parseFloat(ttc.toFixed(2))
      });
    });

    pn16Data.forEach(item => {
      const ht = item.priceRef;
      const ttc = ht * margin;
      variants.push({
        diameter: item.diam,
        pressure: item.press,
        thickness: item.thick,
        weight: item.weight,
        priceHT: parseFloat(ht.toFixed(2)),
        priceTTC: parseFloat(ttc.toFixed(2))
      });
    });

    const hdpeProduct = new Product({
      name: "HDPE Pipe",
      type: "variable",
      icon: "fas fa-water",
      desc: "High-density polyethylene pipe – sold per meter. Prices are TTC (including 15% margin).",
      unit: "meter",
      variants,
      inStock: true
    });

    await hdpeProduct.save();

    // المنتجات الثابتة
    const standardProducts = [
      { name: "Submersible pump 5.5kW", type: "standard", price: 38500, icon: "fas fa-pump-water", desc: "Stainless steel, max flow 35m³/h.", unit: "piece" },
      { name: "Brass Gate Valve 2\"", type: "standard", price: 1850, icon: "fas fa-tools", desc: "PN16, industrial grade.", unit: "piece" },
      { name: "Drip irrigation kit (1ha)", type: "standard", price: 18900, icon: "fas fa-seedling", desc: "Complete with drippers, connectors.", unit: "piece" },
      { name: "Pressure reducing valve", type: "standard", price: 3200, icon: "fas fa-chart-line", desc: "Adjustable, 1½\".", unit: "piece" },
      { name: "Smart water meter", type: "standard", price: 12400, icon: "fas fa-microchip", desc: "IoT ready, remote reading.", unit: "piece" }
    ];

    await Product.insertMany(standardProducts);

    res.json({ msg: "Database seeded with all HDPE diameters (PN10/PN16) +15% margin, and standard products." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;