import Cart from "../models/cart.js";
import Product from "../models/product.js";

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
