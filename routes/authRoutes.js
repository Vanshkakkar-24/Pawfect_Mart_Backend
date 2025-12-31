import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Register new user
// POST /api/auth/register
router.post("/register", registerUser);

// Login user
// POST /api/auth/login
router.post("/login", loginUser);

export default router;
