const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const conn = require('./database');

// static resourse & template engine
// static resourse
app.use(express.static('public'));
// Set EJS as templating engine
app.set('view engine', 'ejs');
// For parsing form data
app.use(express.urlencoded({ extended: true }));


app.get('/create', (req, res) => {
    // Create table in MySQL database
    const sql = `CREATE TABLE IF NOT EXISTS instructor (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100),
        dept_name VARCHAR(100),
        salary INT
    )`;

    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created or already exists");
        res.send("Table created or already exists");
    });
    // then, Insert data into the table    

});


// routing 
app.get('/showdata', (req, res) => {

    const sql = 'SELECT * FROM instructor;';
    conn.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.render('show', { data: result });
    });
});

app.get('/form', function (req, res) {
    res.sendFile(path.join(__dirname, "/public/form.html"));
});

app.get('/formget', (req, res) => {
    // read data from query string 
    const id = req.query.id;
    const name = req.query.name;
    const deptname = req.query.deptname;
    const salary = req.query.salary;
    const insertSql = "INSERT INTO instructor (id, name, dept_name, salary) VALUES (?, ?, ?, ?)";

    conn.query(insertSql, [id, name, deptname, salary], (err, result) => {
        if (err) throw err;
        console.log("Data inserted");
        res.send("Data inserted");
    });
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
}); 