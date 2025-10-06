import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const SERVER_CONFIG = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:3001',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:4000',
};

export const DB_CONFIG = {
  HOST: process.env.DB_HOST,
  PORT: process.env.DB_PORT || 3306,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DATABASE: process.env.DB_DATABASE,
  CONNECTION_LIMIT: process.env.DB_CONNECTION_LIMIT || 10,
  QUEUE_LIMIT: process.env.DB_QUEUE_LIMIT || 0,
  WAIT_FOR_CONNECTIONS: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
};
