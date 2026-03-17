const express = require('express');
const csv = require('csv-parser')
const fs = require('fs')
const path = require('path');
const app = express();
const port = 3000;

const conn = require('./database');
const { render } = require('ejs');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// song,artist,album,year,genre,album_cover
app.get('/create', (req, res) => {
    const sql = `CREATE TABLE IF NOT EXISTS albums (
        song VARCHAR(100) PRIMARY KEY,
        artist VARCHAR(100),
        album VARCHAR(100),
        year INT,
        genre VARCHAR(100),
        album_cover VARCHAR(100)
    )`;

    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created or already exists");
        res.send("Table created or already exists");
    });

    const rows = []

    fs.createReadStream('albums.csv')
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => {
            const values = rows.map(r => [r.song, r.artist, r.album, r.year, r.genre, r.album_cover])

            const sql = `INSERT IGNORE INTO albums (song, artist, album, year, genre, album_cover) VALUES ?`
            conn.query(sql, [values], (err, result) => {
                if (err) throw err
                console.log(`✅ เพิ่ม ${result.affectedRows} แถว`);
            });
        })
});

app.get('/albums', (req, res) => {

    const datasql = "SELECT * FROM albums";

    conn.query(datasql, (err, result) => {
        if (err) throw err;
        res.render('albums', { data: result });
    })
})

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});