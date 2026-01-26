import express from "express";
import { registerUser, loginUser, googleAuth } from "../controllers/authController.js";

const router = express.Router();

// Register new user
// POST /api/auth/register
router.post("/register", registerUser);

// Login user
// POST /api/auth/login
router.post("/login", loginUser);

// Google Login
router.post("/google", googleAuth);

export default router;
