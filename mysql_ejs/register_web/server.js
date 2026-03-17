const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// static resourse
app.use(express.static('public'));
// Set EJS as templating engine
app.set('view engine', 'ejs');
// For parsing form data
app.use(express.urlencoded({ extended: true }));

// เพิ่มใช้งานไฟล์
const conn = require('./database');
// username password email firstname lastname age address และ phone 
app.get('/create', (req, res) => {
    const sql = `CREATE TABLE IF NOT EXISTS Users (
        username VARCHAR(100) PRIMARY KEY,
        password VARCHAR(100),
        email VARCHAR(100),
        firstname VARCHAR(100),
        lastname VARCHAR(100),
        age INT,
        address VARCHAR(100),
        phone VARCHAR(13)
    )`;

    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created or already exists");

        // 2. เมื่อสร้างเสร็จแล้ว (อยู่ในปีกกานี้) ค่อยสั่ง Insert ข้อมูลต่อ
        const insertSql = `INSERT IGNORE INTO Users 
            (username, password, email, firstname, lastname, age, address, phone) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const dummyUser = ['admin123', '123456', 'admin@mail.com', 'สมหมาย', 'ใจดี', 25, 'กรุงเทพฯ', '0812345678'];

        conn.query(insertSql, dummyUser, (err2, result2) => {
            if (err2) throw err2;
            console.log("Dummy user inserted!");

            // 3. ส่งข้อความกลับไปหา Browser แค่ *ครั้งเดียว* ตอนทุกอย่างเสร็จหมดแล้ว
            res.send("สร้างตาราง Users และเพิ่มข้อมูลเริ่มต้นสำเร็จแล้ว!");
        });
    });
});

// static resourse & template engine
app.get('/signin', function (req, res) {
    res.sendFile(path.join(__dirname, "/public/signin.html"));
});

app.get('/user_manage', function (req, res) {
    res.sendFile(path.join(__dirname, "/public/user_manage.html"));
})
// routing 
app.get('/showdata', (req, res) => {

    const sql = 'SELECT * FROM Users;';
    conn.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.render('show', { data: result });
    });
});

app.get('/check-sign-in', (req, res) => {
    // read data from query string 
    const account = req.query.account;
    const password = req.query.password;
    const findSql = "SELECT * FROM Users WHERE (username = ? OR email = ?)";

    conn.query(findSql, [account, account], (err, result) => {
        if (err) throw err;
        if (!result.length) {
            return res.send("ไม่พบผู้ใช้งาน");
        }
        const user = result[0];
        if (password !== user.password) {
            return res.send("รหัสผ่านไม่ถูกต้อง");
        }

        console.log("Login success: ", user.username);
        res.render('show', { data: result });
    });
});

app.get('/add-user', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const email = req.query.email;
    const firstname = req.query.firstname;
    const lastname = req.query.lastname;
    const age = req.query.age;
    const address = req.query.address;
    const phone = req.query.phone;

    const insertsql = "INSERT INTO Users (username, password, email, firstname, lastname, age, address, phone) VALUE (?, ?, ?, ?, ?, ?, ?, ?)";

    conn.query(insertsql, [username, password, email, firstname, lastname, age, address, phone], (err, result) => {
        if (err) throw err;
        console.log("add success");
        return res.send("Add", result[0].username, "Success");
    })
})

app.listen(port, () => {
    console.log(`listening to port ${port}`);
}); 
