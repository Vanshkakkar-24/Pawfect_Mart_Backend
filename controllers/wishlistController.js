import User from "../models/user.js";
import mongoose from "mongoose";

/* ================= ADD / REMOVE ================= */

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const user = await User.findById(req.user._id);

    // Normalize wishlist to ObjectIds only
    user.wishlist = user.wishlist
      .filter(Boolean)
      .map((item) =>
        typeof item === "object" ? item._id : item
      );

    const exists = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (exists) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId
      );
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    // Populate ONLY for response
    const populatedUser = await User.findById(user._id).populate("wishlist");

    res.json(populatedUser.wishlist);
  } catch (error) {
    console.error("Wishlist error:", error);
    res.status(500).json({ message: "Wishlist failed" });
  }
};



/* ================= GET WISHLIST ================= */
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("wishlist");

  res.json(user.wishlist);
};
