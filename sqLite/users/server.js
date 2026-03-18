const express = require("express");
const path = require("path");
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

// Creating the Express server
const app = express();

// Connect to SQLite database
let db = new sqlite3.Database('userdata.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});


// static resourse & templating engine
app.use(express.static('public'));
// Set EJS as templating engine
app.set('view engine', 'ejs');

const crateTablesql = `CREATE TABLE users (
    id INT PRIMARY KEY AUTOINCREMENT,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    username VARCHAR(100),
    password VARCHAR(100),
    email VARCHAR(100)
);`;

db.run(crateTablesql, (err) => {
    if (err) {
        return console.error('Error creating table:', err.message);
    }
    console.log('Table created successful');
});

// routing path
app.get('/', (req, res) => {
    const query = 'SELECT * FROM users';
    db.all(query, [], (err, rows) => {
        if (err) return console.error(err.message);
        console.log(rows);
        res.render('users_list', { data: rows });
    });
})

app.get('/user/:id', (req, res) => {
    const userId = req.params.id
    const getInfoByID = 'SELECT * FROM users WHERE id = ?';

    db.get(getInfoByID, [userId], (err, result) => {
        if (err) throw err;
        res.render('user_info', { data: result });
    })

})

// Starting the server
app.listen(port, () => {
    console.log("Server started.");
}); 