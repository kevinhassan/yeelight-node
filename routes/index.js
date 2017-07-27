const express = require('express');
const router = express.Router();
const Yeelight = require('../models/Yeelight');

let discover = require('../yeelight/discover');

router.route('/yeelights')
    .get((req,res)=>
    {
        Yeelight.find((err, yeelights)=>{
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
            yeelights.map((yeelight)=>{
                Yeelight.findOne({id: yeelight.id},(err,bulb)=>{
                    if (!bulb){
                        //enregistrer l'ampoule en BD
                        yeelight.save((err)=>{
                            if(err) return new Error('Cannot save new bulb in db');
                        });
                    }else{
                    //update bulb saved

                    }
                });
            });
            res.status(200).send({
                status: 200,
                message:'bulbs stored',
                bulbs: yeelights
            });
            /**
             Si l'ID est en BD on update ses valeurs
            **/
        }).catch( error => {
            switch(error){
            case 'send error':
                res.status(500).send({
                    status: 500,
                    message: 'Cannot communicate on the network, please check if your server is connected'
                });
                break;
            case 'no response':
                res.status(200).send({
                    status: 200,
                    message: 'No bulb connected'
                });
                break;
            }
        });
    });

module.exports = router;
