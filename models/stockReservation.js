import mongoose from "mongoose";

const stockReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

/* 🔥 TTL INDEX (AUTO DELETE AFTER EXPIRY) */
stockReservationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("StockReservation", stockReservationSchema);
