const db = require('../database/db');
const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let journalSchema = new Schema({
    _idYeelight: {
        type: String,
        required: true,
        ref: 'Yeelight'
    },
    _idDate: {
        type: Date,
        required: true,
        ref: 'Date'
    },
    dureeAllumage: {
        type: Number,
        default: 0
    }
});
let Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
