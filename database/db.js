require('dotenv').config();
let env = process.env.NODE_ENV;
let config = require('../config/config.json')[env];
var mongoose = require('mongoose');

if (config === undefined) throw new ReferenceError('config database failed undefined')

var options = {
    auth:{authdb: 'admin'},
    db: { native_parser: true },
    server: { poolSize: 5 },
    replset: { rs_name: 'myReplicaSetName' },
    user: config.username,
    pass: config.password
}

mongoose.connect('mongodb://'+config.host+'/'+config.database,options);
let db = mongoose.connection;

db.on('error', function (){
    console.error('Erreur lors de la connexion');
});
db.once('open', function (){
    console.log("Connexion à la base OK");
});

module.exports = db;
