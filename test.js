const express = require('express');
const bodyParser = require('body-parser');
const logger  = require('morgan');
let schedule = require('node-schedule');

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

app.set('port', process.env.PORT || 8080);

const server = app.listen(app.get('port'), '0.0.0.0', () => {
    console.log('Server listening on ' + 'http://127.0.0.1:' + server.address().port);
});
