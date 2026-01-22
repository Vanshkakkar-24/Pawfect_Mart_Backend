import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  isAdmin,
  upload.array("images", 5),
  (req, res) => {
    const imageUrls = req.files.map(file => file.path);

    res.json({
      imageUrls,
    });
  }
);


export default router;
