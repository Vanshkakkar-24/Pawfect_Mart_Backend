import User from "../models/user.js";

// GET wishlist
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
};

// ADD / REMOVE wishlist (toggle)
export const toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.id;

  const index = user.wishlist.indexOf(productId);

  if (index === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(index, 1);
  }

  await user.save();
  res.json(user.wishlist);
};
