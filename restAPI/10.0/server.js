const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

// Creating the Express server
const app = express();

// Connect to SQLite database
let db = new sqlite3.Database('phone.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

const sql = `
    CREATE TABLE IF NOT EXISTS smartphones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand VARCHAR(50),
        model VARCHAR(100),
        release_year INTEGER,
        display VARCHAR(100),
        processor VARCHAR(100),
        ram VARCHAR(20),
        storage VARCHAR(20),
        rear_camera VARCHAR(100),
        front_camera VARCHAR(50),
        battery VARCHAR(50),
        os VARCHAR(50),
        price INTEGER
    );
`;

db.run(sql, (err) => {
    if (err) {
        return console.error('Error creating table:', err.message);
    }
    console.log('Table created successful');

    const rows = []

    fs.createReadStream('smartphones.csv')
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => {

            const insertQuery = `INSERT INTO smartphones (brand, model, release_year, display, processor, ram, storage, rear_camera, front_camera, battery, os, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const stmt = db.prepare(insertQuery);

            let successCount = 0;

            rows.forEach(r => {
                const releaseYear = parseInt(r.ReleaseYear) || 0;
                const price = parseInt(r.Price) || 0;

                stmt.run([r.Brand, r.Model, releaseYear, r.Display, r.Processor, r.RAM, r.Storage, r.RearCamera, r.FrontCamera, r.Battery, r.OS, price], function (err) {
                    if (err) {
                        console.error(`❌ Error inserting ${r.Model}:`, err.message);
                    } else {
                        successCount++;
                    }
                });
            });
        });
});

// static resourse & templating engine
app.use(express.static('public'));
// Set EJS as templating engine
app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.send("Hello! REST API");
});

app.get("/restaurant", (req, res) => {

    const endpoint = 'http://10.110.194.140:8000/menu';
    fetch(endpoint)
        .then(response => response.json())
        .then(menuData => {
            console.log(menuData);
            res.render('menu', { foods: menuData });
        })
        .catch(error => {
            console.log(error);
        });
});

app.get("/restaurant/:id", (req, res) => {
    const id = req.params.id;
    const endpoint = `http://10.110.194.140:8000/items/${id}`;

    fetch(endpoint)
        .then(response => response.json())
        .then(itemData => {
            console.log(itemData);

            // ส่งข้อมูลเมนูเดียวๆ นี้กลับไปให้หน้าเว็บ หรือตอบกลับเป็น JSON
            // (ในที่นี้ส่งเป็น JSON ให้ดูก่อนครับ)
            res.send(itemData);
        })
        .catch(error => {
            console.log(error);
            res.send("เกิดข้อผิดพลาดในการดึงข้อมูลเมนูนี้");
        });
});


app.get("/smartphone", (req, res) => {
    const query = 'SELECT * FROM smartphones';

    db.all(query, (err, result) => {
        if (err) throw err;
        res.send(result);
    })
})

app.get("/smartphone/:id", (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM smartphones WHERE id = ?`

    db.get(query, [id], (err, result) => {
        if (err) throw err;
        res.send(result);
    })
})

app.listen(port, () => {
    console.log(`Starting server at port ${port}`);
});