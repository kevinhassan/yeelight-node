const express = require('express');
const bodyParser = require('body-parser');
const logger  = require('morgan');

let schedule = require('node-schedule');

let request = require('request');
let ville = 'Aubagne'; // TODO: récupérer l'adresse ip et extraire la ville
let weatherApi = 'http://api.openweathermap.org/data/2.5/weather';
let apiKey = 'd0c96820636fedb6a4d8f08144cad566';
let Sunset = require('./models/Sunset');
let discover = require('./yeelight/discover');
const duration = 60* 1000; //milliseconds


const app = express();
require('dotenv').config();

if(process.env.NODE_ENV === 'development') app.use(logger('dev'));

checkSunset();

//add schedule job for 0am to fetch automatically
schedule.scheduleJob({hour: 0, minute: 0, second: 0}, function(){
    checkSunset();
});

//TODO: catch errors
function checkSunset(){
    Sunset.findOne({'date': {$gte: new Date()}}, (err, result)=>{
        // sunset time is stored in DB
        if(result){
            let delay = (result.date - new Date);//milliseconds
            setTimeout(bulbPowerOn, delay);
        }else{
            //get sunset time and it to DB
            getSunset().then((result)=>{
                let delay = (result.date - new Date);//milliseconds
                setTimeout(bulbPowerOn, delay);
            }).catch((err)=>{
                console.error(err);
            });
            //bulbPowerOn
        }
    });
}
function getSunset(){
    return new Promise((resolve, reject)=>{
        request(weatherApi+'?q='+ville+'&APPID='+apiKey, (err, res, body) => {
            if(err) reject(new Error('Fetch weather api failed'));
            let sunsetTime = new Date(JSON.parse(body).sys.sunset *1000);
            if(new Date < sunsetTime){
                let sunset = new Sunset({date: sunsetTime}).save((err)=>{
                    if(err) console.error(err);
                });
                resolve(sunset);
            }else{
                reject(new Error('Cannot save anterior sunset time'));
            }
        });
    });
}
function bulbPowerOn(){
    discover().then((yeelights)=>{
        yeelights.map((yeelight)=>{
            yeelight.set_power('on', 'smooth', duration);
        });
    });
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
    // CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // Custom headers
    res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token,X-Key');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.use('/api/v1/', require('./routes'));

app.use(function(req, res){
    res.status(404).send({
        'status': 404,
        'message': 'Not found !'
    });
});

app.set('port', process.env.PORT || 8080);

const server = app.listen(app.get('port'), '0.0.0.0', () => {
    console.log('Server listening on ' + 'http://127.0.0.1:' + server.address().port);
});
