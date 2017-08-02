const db = require('../database/db');
const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let sunsetSchema = new Schema({
    date: {
        type: Date,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('Date', sunsetSchema);
