import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  template: "welcome" | "payment" | "profile";
  variables: Record<string, any>;
};

// Email templates
const templates: Record<EmailPayload["template"], (vars: Record<string, any>) => string> = {
  welcome: (vars) => `
    <h1>Welcome, ${vars.name}!</h1>
    <p>Thank you for joining us. We're excited to have you on board.</p>
    <p>Team Starkpay.</p>
  `,
  payment: (vars) => `
    <h1>Payment Request</h1>
    <p>Hello there,</p>
    <p>${vars.username} has generated an invoice for you to send <strong>${vars.amount} ${vars.coin}</strong> to their wallet.</p>
    <p>Click <a href="${vars.transactionLink}" target="_blank">here</a> to confirm the transaction.</p>
    <p>Team Starkpay.</p>
  `,
  profile: (vars) => `
    <p>Hello ${vars.name},</p>
    <p>Your Starkpay profile has been successfully updated. If you didn't make this change, please contact support immediately.</p>
    <p>Team Starkpay.</p>
  `,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { to, subject, template, variables } = req.body as EmailPayload;

  if (!to || !subject || !template || !variables) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!templates[template]) {
    return res.status(400).json({ message: "Invalid template type" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = templates[template](variables);

    const info = await transporter.sendMail({
      from: `"Starkpay" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    res.status(200).json({ message: "Email sent successfully", info });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error });
  }
}
