import * as dotenv from 'dotenv';
dotenv.config();

export default () => ({
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    name: process.env.DB_NAME || 'hrms',
  },
  app: {
    port:process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000,
    env: process.env.NODE_ENV || 'development',
    publicUrl: process.env.APP_PUBLIC_URL || process.env.FRONTEND_URL || (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'http://localhost:4200'),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'changeme_jwt_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '3600s',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'changeme_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    saltRounds: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10,
  },
  otp: {
    length: process.env.OTP_LENGTH ? parseInt(process.env.OTP_LENGTH, 10) : 6,
    ttlSeconds: process.env.OTP_TTL_SECONDS ? parseInt(process.env.OTP_TTL_SECONDS, 10) : 300,
    maxAttempts: process.env.OTP_MAX_ATTEMPTS ? parseInt(process.env.OTP_MAX_ATTEMPTS, 10) : 5,
  },
  mail: {
    driver: process.env.MAIL_DRIVER || 'console', // 'console' | 'smtp' | 'sendgrid'
    host: process.env.EMAIL_HOST || 'localhost',
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
    secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : false,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  },
  sms: {
    driver: process.env.SMS_DRIVER || 'console', // 'console' | 'twilio'
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFrom: process.env.TWILIO_FROM || '',
  },
});
