const mongoose = require('mongoose');

const heroSchma =  new mongoose.Schema({
        name:  { type: String, required: true },
        power: { type: String, required: true },
        age:   { type: Number, required: true },
        numPowers: { type: Number, required: true },
        numAbilities: { type: Number, required: true },
    }, {timestamps: true}
);  

module.exports = mongoose.model('Hero', heroSchma);
