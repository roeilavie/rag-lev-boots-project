require('dotenv').config();

const connection = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
};

module.exports = {
  development: connection,
  test: connection,
  production: connection
};
