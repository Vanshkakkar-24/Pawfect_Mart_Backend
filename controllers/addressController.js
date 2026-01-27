import User from "../models/user.js";

/* ================= GET ALL ADDRESSES ================= */
export const getAddresses = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.addresses);
  } catch (err) {
    console.error("Get addresses error:", err);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

/* ================= ADD NEW ADDRESS ================= */
export const addAddress = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    // ✅ Validate required fields
    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    // 🔥 FIRST ADDRESS → FORCE DEFAULT
    const isFirstAddress = user.addresses.length === 0;
    const shouldBeDefault = isFirstAddress ? true : !!isDefault;

    // ✅ If setting default → unset old default
    if (shouldBeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault: shouldBeDefault,
    });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: "Failed to add address" });
  }
};

/* ================= UPDATE ADDRESS ================= */
export const updateAddress = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // ✅ If making default → unset others
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    Object.assign(address, req.body);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
};

/* ================= DELETE ADDRESS ================= */
export const deleteAddress = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressToDelete = user.addresses.id(req.params.addressId);

    if (!addressToDelete) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = addressToDelete.isDefault;

    // Remove address
    addressToDelete.deleteOne();

    // 🔥 If default deleted → make first remaining default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Failed to delete address" });
  }
};
