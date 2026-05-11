const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { getPool } = require('./db');

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('Hello World');
});

const pool = getPool();

pool.getConnection()
    .then(conn => { 
        console.log("MySQL Connected"); 
        conn.release(); 
    })
    .catch(err => { 
        console.log("DB Error:", err); 
    });

app.post('/api/notes', async (req, res) => {
    try {
        const { judul, isi } = req.body;
        if (!judul || !isi) {
            return res.status(400).json({ 
                success: false, 
                message: "Judul dan isi harus diisi" 
            });
        }

        const [result] = await pool.query(
            "INSERT INTO notes (judul, isi) VALUES (?, ?)",
            [judul, isi]
        );

        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

app.get('/api/notes', async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM notes ORDER BY id DESC"
        );

        res.json({ success: true, notes: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

app.put('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, isi } = req.body;

        if (!judul || !isi) {
            return res.status(400).json({ 
                success: false, 
                message: "Judul dan isi harus diisi" 
            });
        }

        const [result] = await pool.query(
            "UPDATE notes SET judul = ?, isi = ? WHERE id = ?",
            [judul, isi, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Catatan tidak ditemukan" 
            });
        }

        res.json({ 
            success: true, 
            message: "Catatan diupdate" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM notes WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Catatan tidak ditemukan" 
            });
        }

        res.json({ 
            success: true, 
            message: "Catatan dihapus" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});
