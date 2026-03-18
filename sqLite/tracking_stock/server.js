const { render } = require("ejs");
const express = require("express");
const path = require("path");
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

// Creating the Express server
const app = express();

// Connect to SQLite database
let db = new sqlite3.Database('stocks.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});


// static resourse & templating engine
app.use(express.static('public'));
// Set EJS as templating engine
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

const sql = ` CREATE TABLE IF NOT EXISTS stocks (
    Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    Firstname VARCHAR(20)  NOT NULL,
    Address VARCHAR(100)  NOT NULL,
    Product VARCHAR(100) NOT NULL,
    TEL VARCHAR(13) NOT NULL,
    Status VARCHAR(24) DEFAULT 'processing' CHECK(Status IN ('processing', 'delivery', 'delivered'))); `;

db.run(sql, (err) => {
    if (err) {
        return console.error('Error creating table:', err.message);
    }
    console.log('Table created successful');
});

// routing path
app.get('/', (req, res) => {
    const stockQuery = `SELECT * FROM stocks;`

    db.all(stockQuery, (err, result) => {
        if (err) throw err;
        res.render('index', { data: result });
    })
})

app.post('/order', (req, res) => {
    const name = req.body.name;
    const product = req.body.product;
    const address = req.body.address;
    const tel = req.body.tel;
    const insertOrder = `INSERT INTO stocks (Firstname, Address, Product, TEL) VALUES (?, ?, ?, ?)`

    db.run(insertOrder, [name, address, product, tel], (err, result) => {
        if (err) throw err;
        return res.redirect('/')
    })
})

app.post('/update-status/:id', (req, res) => {
    const order = req.params.id;
    const newStatus = req.body.status;

    const updateStatus = `UPDATE stocks SET Status = ? WHERE Id = ?`;

    db.run(updateStatus, [newStatus, order], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    })

})

// Starting the server
app.listen(port, () => {
    console.log("Server started.");
}); 