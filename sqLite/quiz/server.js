const express = require("express");
const path = require("path");
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

// Creating the Express server
const app = express();

// Connect to SQLite database
let db = new sqlite3.Database('questions.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});


// static resourse & templating engine
app.use(express.static('public'));
// Set EJS as templating engine
app.set('view engine', 'ejs');
// QID, Stem, Alt_A, Alt_B, Alt_C, Alt_D, Correct
const sql = `CREATE TABLE questions (
QID INTEGER PRIMARY KEY AUTOINCREMENT,
Stem VARCHAR(150) NOT NULL,
Alt_A VARCHAR(50) NOT NULL,
Alt_B VARCHAR(50) NOT NULL,
Alt_C VARCHAR(50) NOT NULL,
Alt_D VARCHAR(50) NOT NULL,
Correct VARCHAR(3) NOT NULL
);`

db.run(sql, (err) => {
    if (err) {
        return console.error('Error creating table:', err.message);
    }
    console.log('Table created successful');
});

// routing path
app.get('/', function (req, res) {
    const query = 'SELECT * FROM questions ';
    db.all(query, (err, rows) => {
        if (err) {
            console.log(err.message);
        }
        console.log(rows);
        res.render('quiz', { data: rows });
    });
});

app.get('/answer/:id/:answer', function (req, res) {
    const qId = req.params.id;
    const answer = req.params.answer;
    const getAns = 'SELECT * FROM questions WHERE QID = ?';

    db.get(getAns, [qId], (err, result) => {
        if (err) throw err;
        if (result.Correct === answer) return res.send("<h1>correct</h1> <a href='/'>back to quiz</a>");
        return res.send("<h1>incorrect</h1> <a href='/'>back to quiz</a>");
    });
});

// Starting the server
app.listen(port, () => {
    console.log("Server started.");
}); 