const express = require("express");
const path = require("path");
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Connect to SQLite database
let db = new sqlite3.Database('employees.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

// routing path

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/create', function (req, res) {

    // insert data into table 
    const sql = ` CREATE TABLE employees (
    EmployeeId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    LastName NVARCHAR(20)  NOT NULL,
    FirstName NVARCHAR(20)  NOT NULL,
    Title NVARCHAR(30),
    Phone NVARCHAR(24),
    Email NVARCHAR(60) ); `;

    db.run(sql, (err) => {
        if (err) {
            return console.error('Error creating table:', err.message);
        }
        console.log('Table created successful');
    });
})

app.get('/show', (req, res) => {
    const query = 'SELECT * FROM employees';
    db.all(query, [], (err, rows) => {
        if (err) return console.error(err.message);
        res.render('show', { data: rows });
    });
});

app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/form.html"));
});

app.get('/formget', (req, res) => {
    const { fname, lname, title, email, phone } = req.query;

    const sql = `INSERT INTO employees (FirstName, LastName, Title, Email, Phone) 
                 VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [fname, lname, title, email, phone], (err) => {
        if (err) return res.send(err.message);
        console.log('Data inserted successfully');
        res.redirect('/show');
    });
});

// Starting the server
app.listen(port, () => {
    console.log("Server started.");
}); 