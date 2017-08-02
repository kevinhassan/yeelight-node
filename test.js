const express = require('express');
const bodyParser = require('body-parser');
const logger  = require('morgan');
let schedule = require('node-schedule');

let request = require('request');
let ville = 'Aubagne'; // TODO: récupérer l'adresse ip et extraire la ville
let weatherApi = 'http://api.openweathermap.org/data/2.5/weather';
let apiKey = 'd0c96820636fedb6a4d8f08144cad566';
let Sunset = require('./models/Sunset');

const app = express();
require('dotenv').config();

if(process.env.NODE_ENV === 'development') app.use(logger('dev'))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//every day at 00:00:00
let rule = {hour: 0, minute: 0, second: 0};

/**
*   First check on the DB if sunset date exist:
*   - yes :   * add cron task to switch on bulb at this time
*
*   - no  :   * fetch with weather api the sunset time
*             * add to DB
*             * add cron task
*
*   -> add schedule job for 0am to fetch automatically
**/

//TODO: catch errors
Sunset.findOne({'date': {$gte: new Date()}}, (err, result)=>{
    // sunset time is stored in DB
    if(result){
        //Add cron task to switch on
    }else{
        getSunset().then((sunset)=>{
            //add sunset time to DB
            new Sunset({date: sunset}).save((err)=>{
                if(err) console.error(err);
            });
        });
    }
    //add schedule job for 0am to fetch automatically
    schedule.scheduleJob(rule, function(){
        getSunset().then((sunset)=>{
            //add sunset time to DB
            new Sunset({date: sunset}).save((err)=>{
                if(err) console.error(err);
            });
        });
    });
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
