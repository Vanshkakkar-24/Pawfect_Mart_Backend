import StockReservation from "../models/stockReservation.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js";

/* ================= GET CART ================= */
export const getCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    res.json(cart || { items: [] });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

/* ================= ADD / UPDATE CART ================= */
export const addToCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
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
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    } else {
      if (quantity > 0) {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to update cart" });
  }
};

/* ================= REMOVE FROM CART ================= */
export const removeFromCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

/* ================= LOCK CART STOCK ================= */
export const lockCartStock = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    await StockReservation.deleteMany({ user: userId });

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

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
        activeReservations.length > 0
          ? activeReservations[0].totalReserved
          : 0;

      const available = product.stock - reservedQty;

      if (available < item.quantity) {
        return res.status(409).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }
    }

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
  } catch (error) {
    console.error("Lock stock error:", error);
    res.status(500).json({ message: "Failed to lock stock" });
  }
};

/* ================= UNLOCK CART STOCK ================= */
export const unlockCartStock = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await StockReservation.deleteMany({ user: req.user._id });

    res.json({ message: "Stock reservation released" });
  } catch (error) {
    console.error("Unlock stock error:", error);
    res.status(500).json({ message: "Failed to release stock" });
  }
};
