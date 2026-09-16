const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// --- CRUD API ---

// 1. Create a new hero
app.post('/api/heroes', (req, res) => {
    const { name, power, age, num_powers, num_abilities } = req.body;
    const sql = 'INSERT INTO heroes (name, power, age, num_powers, num_abilities) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, power, age, num_powers, num_abilities], (err, result) => {
        if (err) {
            console.error('Error creating hero:', err);
            res.status(500).json({ error: 'Failed to create hero' });
        } else {
            res.status(201).json({ message: 'Hero created successfully', HeroId: result.insertId, ...req.body });
        }
    });
});

// 2. Read all heroes
app.get('/api/heroes', (req, res) => {
    db.query("SELECT * FROM heroes", (err, results) => {
        if (err) {
            console.error('Error reading heroes:', err);
            res.status(500).json({ error: 'Failed to read heroes' });
        } else {
            res.status(200).json(results);
        }
    });
});

// 3. Read a specific hero by ID
app.get('/api/heroes/:id', (req, res) => {
    db.query("SELECT * FROM heroes WHERE id = ?", [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Failed to read hero' });
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Hero not found' });
        } res.status(200).json(results[0]);
    });
});

// 4. Update a specific hero by ID
app.put('/api/heroes/:id', (req, res) => {
    const { name, power, age, num_powers, num_abilities } = req.body;
    const sql = 'UPDATE heroes SET name = ?, power = ?, age = ?, num_powers = ?, num_abilities = ? WHERE id = ?';
    db.query(sql, [name, power, age, num_powers, num_abilities, req.params.id], (err, result) => {
        if (err) res.status(500).json({ error: 'Failed to update hero' });
        if (result.affectedRows === 0) res.status(404).json({ error: 'Hero not found' });
        res.status(200).json({ message: 'Hero updated successfully', HeroId: req.params.id, ...req.body });
    });
});

// 5. Delete a specific hero by ID
app.delete('/api/heroes/:id', (req, res) => {
    db.query("DELETE FROM heroes WHERE id = ?", [req.params.id], (err, result) => {
        if (err) res.status(500).json({ error: 'Failed to delete hero' });
        if (result.affectedRows === 0) res.status(404).json({ error: 'Hero not found' });
        res.status(200).json({ message: 'Hero deleted successfully', HeroId: req.params.id });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});