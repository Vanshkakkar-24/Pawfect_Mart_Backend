import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import StockReservation from "../models/stockReservation.js";

export const placeOrder = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    /* ================= STOCK VALIDATION ================= */
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ message: "Invalid product in cart" });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
    }

    /* ================= REDUCE STOCK ================= */
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    /* ================= CREATE ORDER ================= */
    const orderProducts = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      address,              // snapshot
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "pending",
      orderStatus: "processing",
    });

    /* ================= CLEAR CART ================= */
    cart.items = [];
    await cart.save();

    /* ================= CLEAR RESERVATIONS (OPTIONAL) ================= */
    await StockReservation.deleteMany({ user: req.user._id });

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user");
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  order.orderStatus = req.body.status;
  await order.save();
  res.json(order);
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Admin can access any order
    if (req.user.role === "admin") {
      return res.json(order);
    }

    // ✅ User can access ONLY their own order
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    console.error("getOrderById error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};
