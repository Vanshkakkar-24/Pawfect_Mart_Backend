import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCart, addToCart, removeFromCart, unlockCartStock } from "../controllers/cartController.js";
import { lockCartStock } from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.delete("/:productId", protect, removeFromCart);
router.post("/lock", protect, lockCartStock);
router.post("/unlock", protect, unlockCartStock);

export default router;
