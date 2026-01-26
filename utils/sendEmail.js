import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (to, name) => {
    await resend.emails.send({
        from: "PawfectMart <onboarding@resend.dev>",
        to,
        subject: "Welcome to PawfectMart 🐶🐱",
        html: `
      <h2>Hi ${name} 👋</h2>
      <p>Welcome to <strong>PawfectMart</strong>!</p>
      <p>We're excited to have you onboard 🐾</p>
      <br/>
      <p>- Team PawfectMart</p>
    `,
    });
};
