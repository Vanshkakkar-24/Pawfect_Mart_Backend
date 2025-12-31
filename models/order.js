import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number
      }
    ],
    totalAmount: Number,
    paymentMethod: String,
    paymentStatus: {
      type: String,
      default: "pending"
    },
    orderStatus: {
      type: String,
      default: "processing"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
