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
    image: String
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
