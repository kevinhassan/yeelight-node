const express = require('express');
const bodyParser = require('body-parser');
const logger  = require('morgan')
const app = express();
require('dotenv').config();

if(process.env.NODE_ENV === 'development') app.use(logger('dev'))

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
