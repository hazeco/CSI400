const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Hero = require('./models/Hero');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL);

// --- CRUD API ---

// 1. Create a new hero
app.post('/api/heros', async (req, res) => {
    try {
        const hero = new Hero(req.body);
        const savedHero = await hero.save();
        res.status(201).json(savedHero);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 2. Get all heroes
app.get('/api/heros', async (req, res) => {
    try {
        const hero = await Hero.find();
        res.json(hero);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Get a hero by ID
app.get('/api/heros/:id', async (req, res) => {
    try {
        const hero = await Hero.findById(req.params.id);
        if (!hero) {
            return res.status(404).json({ message: 'Hero not found' });
        }
        res.json(hero);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Update a hero by ID
app.put('/api/heros/:id', async (req, res) => {
    try {
        const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hero) {
            return res.status(404).json({ message: 'Hero not found' });
        }
        res.json(hero);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Delete a hero by ID
app.delete('/api/heros/:id', async (req, res) => {
    try {
        const hero = await Hero.findByIdAndDelete(req.params.id);
        if (!hero) {
            return res.status(404).json({ message: 'Hero not found' });
        }
        res.json({ message: 'Hero deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});