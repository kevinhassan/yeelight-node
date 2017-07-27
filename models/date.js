const db = require('../database/db');
const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let dateSchema = new Schema({
    date: {
        type: Date,
        unique: true,
        required: true,
        index: true
    },
    heureCouche: {
        type: Date,
        required: true
    }
});
let Date = mongoose.model('Date', dateSchema);

module.exports = Date;
