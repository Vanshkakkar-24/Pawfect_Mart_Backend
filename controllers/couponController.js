import Coupon from "../models/coupon.js";

/* ================= ADMIN ================= */

export const createCoupon = async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderValue,
    quantity
  } = req.body;

  const exists = await Coupon.findOne({ code });
  if (exists) {
    return res.status(400).json({ message: "Coupon already exists" });
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minOrderValue,
    quantity
  });

  res.status(201).json(coupon);
};

export const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

export const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  Object.assign(coupon, req.body);
  await coupon.save();

  res.json(coupon);
};

export const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  await coupon.deleteOne();
  res.json({ message: "Coupon deleted" });
};

/* ================= USER ================= */

export const applyCoupon = async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    return res.status(400).json({ message: "Invalid coupon" });
  }

  if (coupon.quantity <= 0) {
    return res.status(400).json({ message: "Coupon expired" });
  }

  if (coupon.usedBy.includes(req.user._id)) {
    return res.status(400).json({ message: "Coupon already used" });
  }

  if (cartTotal < coupon.minOrderValue) {
    return res.status(400).json({
      message: `Minimum order value is ₹${coupon.minOrderValue}`
    });
  }

  let discount = 0;

  if (coupon.discountType === "PERCENT") {
    discount = Math.round((cartTotal * coupon.discountValue) / 100);
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    discount,
    finalAmount: Math.max(cartTotal - discount, 0),
    couponCode: coupon.code
  });
};
