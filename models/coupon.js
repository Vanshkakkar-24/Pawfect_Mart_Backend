import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    discountType: {
      type: String,
      enum: ["PERCENT", "FLAT"],
      required: true
    },

    discountValue: {
      type: Number,
      required: true
    },

    minOrderValue: {
      type: Number,
      default: 0
    },

    quantity: {
      type: Number,
      required: true
    },

    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
