// USE THIS FILE TO IMPORT MYSQL2
// CONNECT APP TO MYSQL DATABASE
require('dotenv').config();
// import mysql2 package
const mysql = require('mysql2');

// connect app to MySQL database
const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        // your MySQL username, 'root' is default user
        user: process.env.DB_USER,
        // your MySQL password
        password: process.env.DB_PW,
        database: process.env.DB_NAME
    }
);

// export for use in server.js
module.exports = db;