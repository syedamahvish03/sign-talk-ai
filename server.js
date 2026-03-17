const nlp = require('compromise');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// --- SETTINGS ---
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(process.cwd(), './')));

// --- DATABASE ---
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'SQLSYSTEM',
    database: 'GestureDB'
});

db.connect(err => {
    if (err) {
         return console.error("❌ SQL Connection Error: " + err.message);
    }
    console.log("✅ Database Connected Successfully!");
});

// --- ROUTES ---
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.get('/get-gestures', (req, res) => {
    db.query("SELECT * FROM gesture_signatures", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/update-gesture', (req, res) => {
    const { name, points } = req.body;
    const query = "INSERT INTO gesture_signatures (gesture_name, points_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE points_json = VALUES(points_json)";
    db.query(query, [name, JSON.stringify(points)], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(200);
    });
});

app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));