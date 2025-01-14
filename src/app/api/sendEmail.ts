import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

type EmailPayload = {
    to: string;
    subject: string;
    template: 'welcome' | 'resetPassword';
    variables: Record<string, any>;
};

// Email templates function
const templates: Record<EmailPayload['template'], (vars: Record<string, any>) => string> = {
    welcome: (vars) => `
        <h1>Welcome, ${vars.name}!</h1>
        <p>Thank you for joining us. We're excited to have you on board.</p>
    `,
    resetPassword: (vars) => `
        <h1>Password Reset Request</h1>
        <p>Hello, ${vars.name}. Click the link below to reset your password:</p>
        <a href="${vars.resetLink}">Reset Password</a>
    `,
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { to, subject, template, variables } = req.body as EmailPayload;

    if (!to || !subject || !template || !variables) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate the template
    if (!templates[template]) {
        return res.status(400).json({ message: 'Invalid template type' });
    }

    // Define your email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        const htmlContent = templates[template](variables);

        const info = await transporter.sendMail({
            from: `"Your App Name" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        });

        res.status(200).json({ message: 'Email sent successfully', info });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error });
    }
}
