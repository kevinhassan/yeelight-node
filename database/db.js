require('dotenv').config();
let env = process.env.NODE_ENV;
let config = require('../config/config.json')[env];
var mongoose = require('mongoose');

if (config === undefined) throw new ReferenceError('config database failed undefined')

var options = {
    useMongoClient: true
};

mongoose.connect('mongodb://'+config.host+'/'+config.database, options)

    .on('error', function (){
        console.error('Erreur lors de la connexion');
    })
    .once('open', function (){
        console.log("Connexion à la base OK");
    })
    .once('close', function (){
        console.log("Déconnection");
    });
module.exports = mongoose;
