import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    category: {
      type: String,
      enum: ["dog", "cat"]
    },
    subCategory: String,
    stock: Number,
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
