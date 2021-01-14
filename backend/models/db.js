const Pool = require("pg").Pool;
const dotenv = require("dotenv");

dotenv.config();

const DB_USER = process.env.DB_USER || 'default';
const DB_PASS = process.env.DB_PASS || 'default';
const DB_NAME = process.env.DB_NAME || 'default';
const DB_HOST = process.env.DB_HOST || 'default';
const DB_PORT = process.env.DB_PORT || 'default';

const devConfig = {
  user: DB_USER,
  password: DB_PASS,
  host: DB_HOST,
  port:DB_PORT,
  database: DB_NAME 
};

const prodConfig = {
  connectionString : process.env.DATABASE_URL || 'default'
}

const pool = new Pool(process.env.NODE_ENV === "production" ? prodConfig : devConfig);

module.exports = pool;