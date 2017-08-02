const express = require('express');
const bodyParser = require('body-parser');
const logger  = require('morgan');
let schedule = require('node-schedule');

let request = require('request');
let ville = 'Aubagne'; // récupérer l'adresse ip et extraire la ville
let weatherApi = 'http://api.openweathermap.org/data/2.5/weather';
let apiKey = 'd0c96820636fedb6a4d8f08144cad566';

const app = express();
require('dotenv').config();

if(process.env.NODE_ENV === 'development') app.use(logger('dev'))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//every day at 00:00:00
let rule = {hour: 0, minute: 0, second: 0};

//get weather api info
schedule.scheduleJob(rule, function(){

});

function getSunset(){
    return new Promise((resolve, reject)=>{
        request(weatherApi+'?q='+ville+'&APPID='+apiKey, (err, res, body) => {
            let sunset = new Date(JSON.parse(body).sys.sunset *1000);
            return resolve(sunset);
        });
    });
}
app.set('port', process.env.PORT || 8080);

const server = app.listen(app.get('port'), '0.0.0.0', () => {
    console.log('Server listening on ' + 'http://127.0.0.1:' + server.address().port);
});
