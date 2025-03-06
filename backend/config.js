import dotenv from 'dotenv'

dotenv.config()

export const {
  PORT = 3002,
  SALT_ROUNDS = 10,
  DB_PASSWORD,
  DB_USER = 'root',
  DB_NAME = 'users_db',
  DB_PORT = 3306,
  DB_HOST = 'localhost',
  REFRESH_KEY,
  API_PRIVATE_KEY,
  API_WEBHOOK_KEY,
  STRIPE_WEBHOOK_SECRET,
  ACCESS_KEY,
  ADMIN_USERNAME1,
  ADMIN_USERNAME2
} = process.env

export const configDB = {
  host: DB_HOST,
  password: DB_PASSWORD,
  port: DB_PORT,
  user: DB_USER,
  database: DB_NAME,
  dateStrings: true
}
