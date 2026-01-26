import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (to, name) => {
  const info = await transporter.sendMail({
    from: `"PawfectMart 🐾" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to PawfectMart 🐶🐱",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Welcome to PawfectMart, ${name}! 🐾</h2>
        <p>We're thrilled to have you with us.</p>
        <p>
          Explore premium pet products, exclusive offers,
          and hassle-free shopping.
        </p>
        <p>
          If you need help, just reply to this email or chat with us on WhatsApp 💚
        </p>
        <strong>- Team PawfectMart</strong>
      </div>
    `,
  });
};