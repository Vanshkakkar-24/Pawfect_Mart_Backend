import User from "../models/user.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    // 1️⃣ Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    // 2️⃣ Check if user already exists
    let user = await User.findOne({ email });

    // 3️⃣ If user doesn't exist → create Google user
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        isGoogleUser: true,
        password: undefined, // IMPORTANT: no password for Google users
      });
    }

    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError.message);
    }

    // 4️⃣ Prevent normal users from logging in via Google accidentally
    if (!user.isGoogleUser) {
      return res.status(400).json({
        message: "This email is registered using email & password",
      });
    }

    // 5️⃣ Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Send response
    res.status(200).json({
      token: jwtToken,
      user,
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user"
  });

  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (emailError) {
    console.error("Welcome email failed:", emailError.message);
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id)
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id)
  });
};
