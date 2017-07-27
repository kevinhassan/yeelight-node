const express = require('express');
const router = express.Router();
const Yeelight = require('../models/yeelight');

let discover = require('../yeelight/discover');

router.route('/yeelights')
    .get((req,res)=>
    {
        Yeelight.find(function(err, yeelights){
            if (err){
                res.send(err);
            }
            yeelights.length === 0 ? res.status(404).send({
                status: 404,
                message:'No bulb saved'
            }):
                res.status(200).send({
                    status: 200,
                    message:'bulbs found',
                    bulbs: yeelights
                });
        });
    });

router.route('/yeelights/search')
    .get((req,res)=>
    {
        discover().then((yeelights)=>{
            res.status(200).send(yeelights);
            /**
             TODO: Si la liste est vide on fait rien
             Sinon on ajoute les ampoule dont l'ID n'est pas en BD
             Si l'ID est en BD on update ses valeurs
            **/
        }).catch( error => {
            switch(error){
            case 'send error':
                res.status(404).send({
                    status: 404,
                    message: 'Cannot communicate on the network, please check if your server is connected'
                });
                break;
            case 'no response':
                res.status(404).send({
                    status: 404,
                    message: 'No bulb connected'
                });
                break;
            }
        });
    });

module.exports = router;
