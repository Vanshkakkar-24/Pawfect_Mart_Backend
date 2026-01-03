import StockReservation from "../models/stockReservation.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js";

/* ================= GET CART ================= */
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product");

  res.json(cart || { items: [] });
};

/* ================= ADD / UPDATE CART ================= */
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID required" });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // 🆕 Create cart
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity }],
    });

    return res.status(201).json(cart);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // ❌ Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // 🔁 SET quantity (NOT +=)
      cart.items[itemIndex].quantity = quantity;
    }
  } else {
    if (quantity > 0) {
      // ➕ Add new item
      cart.items.push({ product: productId, quantity });
    }
  }

  await cart.save();
  res.json(cart);
};

/* ================= REMOVE FROM CART ================= */
export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  res.json(cart);
};

export const lockCartStock = async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Clear any existing reservations for this user (idempotent)
  await StockReservation.deleteMany({ user: userId });

  // Check availability for each item
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    // Sum active reservations for this product
    const activeReservations = await StockReservation.aggregate([
      {
        $match: {
          product: product._id,
          expiresAt: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: "$product",
          totalReserved: { $sum: "$quantity" },
        },
      },
    ]);

    const reservedQty =
      activeReservations.length > 0 ? activeReservations[0].totalReserved : 0;

    const available = product.stock - reservedQty;

    if (available < item.quantity) {
      return res.status(409).json({
        message: `Insufficient stock for ${product.name}`,
      });
    }
  }

  // Create reservations (2 minutes)
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  const reservations = cart.items.map((item) => ({
    user: userId,
    product: item.product._id,
    quantity: item.quantity,
    expiresAt,
  }));

  await StockReservation.insertMany(reservations);

  res.json({
    message: "Stock locked for checkout",
    expiresAt,
  });
};

export const unlockCartStock = async (req, res) => {
  try {
    await StockReservation.deleteMany({
      user: req.user._id,
    });

    res.json({ message: "Stock reservation released" });
  } catch (error) {
    console.error("Unlock stock error:", error);
    res.status(500).json({ message: "Failed to release stock" });
  }
};