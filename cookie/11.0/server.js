const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// 1. ตั้งค่า Middleware
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key-for-your-store',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // ให้ตะกร้าอยู่ได้ 10 นาที
}));


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
// 2. เชื่อมต่อ Database และสร้างข้อมูลให้อัตโนมัติ (เติมส่วนที่อาจารย์เว้นไว้)
const db = new sqlite3.Database('store.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS phones (
        id INTEGER PRIMARY KEY,
        name varchar(120) NOT NULL,
        price REAL NOT NULL,
        storage varchar(50) NOT NULL,
        camera varchar(20) NOT NULL,
        pimage varchar(100) NOT NULL
    )`);

    // เช็คว่ามีข้อมูลหรือยัง ถ้ายังให้ Insert เข้าไป
    db.get("SELECT COUNT(*) AS count FROM phones", (err, row) => {
        if (row.count === 0) {
            const insertData = `INSERT INTO phones (id, name, price, storage, camera, pimage) VALUES
            (1, 'Samsung Galaxy S25 Ultra', 1299, '12/512 GB', '200MP', 'image-31.jpg'),
            (2, 'iPhone 16 Pro Max', 1199, '8/256 GB', '48MP', 'image-32.jpg'),
            (3, 'Google Pixel 10 Pro', 1219, '12/256 GB', '48MP', 'image-33.jpg'),
            (4, 'Huawei Pura 80 Ultra', 1680, '12/512 GB', '50MP', 'image-34.jpg'),
            (5, 'Samsung Galaxy Z Fold 7', 2420, '12/256 GB', '200MP', 'image-35.jpg'),
            (6, 'Samsung Galaxy Z Flip 7', 1099, '12/256 GB', '50MP', 'image-36.jpg'),
            (7, 'OnePlus 13', 999, '12/256 GB', '50MP', 'image-37.jpg')`;
            db.run(insertData);
            console.log("✅ สร้างตารางและเพิ่มข้อมูลมือถือเรียบร้อย!");
        }
    });
});

// 3. สร้าง Routes ต่างๆ
app.get('/', (req, res) => {
    res.redirect('/menu'); // เด้งไปหน้าเมนูเลย
});

// หน้าแสดงรายการสินค้า
app.get('/menu', (req, res) => {
    db.all(`SELECT * FROM phones`, (err, rows) => {
        if (err) return console.error(err.message);
        // แก้ไข yourdata เป็นตัวแปร rows ที่ดึงมาจาก Database
        res.render('menu', { data: rows });
    });
});

// ระบบเพิ่มลงตะกร้า (เก็บลง Session)
app.get('/add-to-cart/:item', (req, res) => {
    const item = req.params.item;
    if (!req.session.cart) {
        req.session.cart = []; // ถ้ายังไม่มีตะกร้า ให้สร้างตะกร้าเปล่า
    }
    req.session.cart.push(item); // หยิบของใส่ตะกร้า
    console.log(`🛒 หยิบมือถือ ID '${item}' ลงตะกร้าแล้ว...`);
    res.redirect('/menu'); // กลับไปหน้าสินค้าต่อ
});

// หน้าดูตะกร้าสินค้า (อัปเดตให้นับจำนวนของซ้ำได้)
app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];

    // ถ้าตะกร้าว่าง
    if (cart.length === 0) {
        return res.render('cart', { data: [], itemCounts: {} });
    }

    // 🌟 1. นับจำนวนสินค้าที่ซ้ำกัน (เช่น มี ID 1 สองเครื่อง)
    const itemCounts = {};
    cart.forEach(id => {
        itemCounts[id] = (itemCounts[id] || 0) + 1;
    });

    // 🌟 2. ดึงเฉพาะ ID ที่ไม่ซ้ำไปค้นหาใน Database
    const uniqueIds = Object.keys(itemCounts);
    const placeholders = uniqueIds.map(() => '?').join(',');
    const query = `SELECT * FROM phones WHERE id IN (${placeholders})`;

    db.all(query, uniqueIds, (err, rows) => {
        if (err) return console.error(err.message);

        // ส่งทั้งข้อมูลมือถือ (rows) และจำนวนชิ้น (itemCounts) ไปที่หน้า EJS
        res.render('cart', { data: rows, itemCounts: itemCounts });
    });
});

// ล้างตะกร้า
app.get('/clear-cart', (req, res) => {
    req.session.cart = [];
    res.redirect('/menu');
});

app.listen(PORT, () => {
    console.log(`🚀 Store Server is running on http://localhost:${PORT}`);
});