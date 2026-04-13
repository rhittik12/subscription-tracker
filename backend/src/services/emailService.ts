import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Email not configured. Skipping email send.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { color: #1e293b; font-size: 20px; margin: 0; }
        .header p { color: #64748b; font-size: 14px; margin-top: 4px; }
        .content { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 16px 0; }
        .content p { margin: 8px 0; color: #334155; font-size: 15px; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px; }
        .btn { display: inline-block; background: #6366f1; color: #fff; padding: 10px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Subscription Reminder</h1>
          <p>Your subscription is renewing soon</p>
        </div>
        <div class="content">
          <p>${text}</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" class="btn">View Dashboard</a>
        </div>
        <div class="footer">
          <p>Subscription Tracker</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Subscription Tracker" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html: htmlContent,
  });
}
