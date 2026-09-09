require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'csv_user',
  password: process.env.DB_PASSWORD || 'csv_password',
  database: process.env.DB_NAME || 'csv_manager',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
};

module.exports = {
  development: base,
  test: { ...base, database: process.env.DB_NAME || 'csv_manager_test' },
  production: base,
};
