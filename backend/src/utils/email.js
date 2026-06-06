import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth:
    env.smtpUser && env.smtpPass
      ? {
          user: env.smtpUser,
          pass: env.smtpPass,
        }
      : undefined,
});

// Verify SMTP connection on startup
if (env.smtpUser && env.smtpPass) {
  transporter.verify((error) => {
    if (error) {
      console.error(
        'SMTP configuration error:',
        error.message
      );
    } else {
      console.log(
        'SMTP server is ready to send emails'
      );
    }
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}) {
  if (!to) {
    throw new Error(
      'Recipient email address is required'
    );
  }

  const mailOptions = {
    from: env.emailFrom,
    to,
    subject,
    html,
    text,
  };

  try {
    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      `Email sent: ${info.messageId}`
    );

    return info;
  } catch (error) {
    console.error(
      'Email sending failed:',
      error.message
    );

    throw error;
  }
}

export default sendEmail;


