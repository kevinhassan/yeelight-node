const db = require('../database/db');
const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let yeelightSchema = new Schema({
    ip         :
    {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    port       : {
        type: Number,
        required: true
    },
    id         :
    {
        type: String,
        unique: true,
        index: true
    },
    power      :
    {
        type: String,
        lowercase: true,
        required: true,
        validate: {
            validator: function(v){
                return v === 'on' || v === 'off';
            },
            message: '{VALUE} is not valid must be "on" or "off"'
        }
    },
    bright     :
    {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    colorMode  :
    {
        type: Number,
        required: true,
        min: 1,
        max: 3
    },
    ct         :
    {
        type: Number,
        required: true,
        min: 1700,
        max: 6500
    },
    rgb        :
    {
        type: Number,
        required: true,
        min: 0,
        max: 16777215
    },
    hue        :
    {
        type: Number,
        required: true,
        min: 0,
        max: 359
    },
    sat        :
    {
        type: Number,
        required: true,
        min: 0,
        max: 359
    },
    name       :
    {
        type: String,
        default: ''
    }
});
let Yeelight = mongoose.model('Yeelight', yeelightSchema);

module.exports = Yeelight;
