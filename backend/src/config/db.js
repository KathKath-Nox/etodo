const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'db',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || 'password123',
  database: process.env.MYSQL_DATABASE || 'etodo'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    setTimeout(() => db.connect(), 2000);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = db;