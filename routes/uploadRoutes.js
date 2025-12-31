import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  isAdmin,
  upload.single("image"),
  (req, res) => {
    res.json({
      imageUrl: req.file.path,
    });
  }
);

export default router;
