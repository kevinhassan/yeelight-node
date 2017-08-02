const mongoose = require('../database/db');

let Schema = mongoose.Schema;

let sunsetSchema = new Schema({
    date: {
        type: Date,
        unique: true,
        required: true
    }
});

let Sunset = mongoose.model('Sunset', sunsetSchema);
module.exports = Sunset;
