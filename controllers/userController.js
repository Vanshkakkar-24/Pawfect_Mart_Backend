import User from "../models/user.js";

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("wishlist");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};
