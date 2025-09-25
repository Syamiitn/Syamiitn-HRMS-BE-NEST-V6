import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().allow(''),
  DB_NAME: Joi.string().required(),
  APP_PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  // Auth/JWT
  JWT_SECRET: Joi.string().default('changeme_jwt_secret'),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),
  JWT_REFRESH_SECRET: Joi.string().allow(''),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  BCRYPT_SALT_ROUNDS: Joi.number().default(10),
  // OTP
  OTP_LENGTH: Joi.number().default(6),
  OTP_TTL_SECONDS: Joi.number().default(300),
  OTP_MAX_ATTEMPTS: Joi.number().default(5),
  // Mail
  MAIL_DRIVER: Joi.string().valid('console', 'smtp', 'sendgrid').default('console'),
  EMAIL_HOST: Joi.string().default('localhost'),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().default(false),
  EMAIL_USER: Joi.string().allow(''),
  EMAIL_PASSWORD: Joi.string().allow(''),
  EMAIL_FROM: Joi.string().default('no-reply@example.com'),
  SENDGRID_API_KEY: Joi.string().allow(''),
  // SMS
  SMS_DRIVER: Joi.string().valid('console', 'twilio').default('console'),
  TWILIO_ACCOUNT_SID: Joi.string().allow(''),
  TWILIO_AUTH_TOKEN: Joi.string().allow(''),
  TWILIO_FROM: Joi.string().allow(''),
});
