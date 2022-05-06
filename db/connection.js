// USE THIS FILE TO IMPORT MYSQL2
// CONNECT APP TO MYSQL DATABASE

// import mysql2 package
const mysql = require('mysql2');

// connect app to MySQL database
const db = mysql.createConnection(
    {
        host: 'localHost',
        // your MySQL username, 'root' is default user
        user: 'root',
        // your MySQL password
        password: '12parsecKe$$elruN',
        database: 'company'
    }
);

// export for use in server.js
module.exports = db;