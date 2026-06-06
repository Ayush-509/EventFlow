import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['JWT_SECRET'];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',

  port: Number(process.env.PORT) || 5050,

  mongoUri:
    process.env.MONGO_URI?.trim() ||
    'mongodb://127.0.0.1:27017/event_mgmt',

  jwtSecret: process.env.JWT_SECRET.trim(),

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN?.trim() || '7d',

  clientUrl:
    process.env.CLIENT_URL?.trim() ||
    'http://localhost:5173',

  smtpHost:
    process.env.SMTP_HOST?.trim() ||
    'smtp.gmail.com',

  smtpPort:
    Number(process.env.SMTP_PORT) || 587,

  smtpUser:
    process.env.SMTP_USER?.trim() || '',

  smtpPass:
    process.env.SMTP_PASS?.trim() || '',

  emailFrom:
    process.env.EMAIL_FROM?.trim() ||
    'CampusEvents <no-reply@ems.local>',
};

export default env;


