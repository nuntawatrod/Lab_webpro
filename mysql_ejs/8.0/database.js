// database.js
const mysql = require('mysql2');
const conn = mysql.createConnection({
    host: "webdev.it.kmitl.ac.th",
    user: "s67070088",
    password: "PQG55JLC55C",
    database: "s67070088"
});

// open the MySQL connection
conn.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

module.exports = conn;