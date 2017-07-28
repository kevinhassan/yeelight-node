const express = require('express');
const router = express.Router();
const Yeelight = require('../models/Yeelight');

let discover = require('../yeelight/discover');

//Lister toutes les ampoules stockées en base de données
router.route('/yeelights')
    .get((req, res)=>
    {
        Yeelight.find((err, yeelights)=>{
            if (err){
                res.send(err);
            }
            return yeelights.length === 0 ? res.status(404).send({
                status: 404,
                message:'No bulb saved'
            }):
                res.status(200).send({
                    status: 200,
                    message:'Fetch bulb successfully',
                    bulbs: yeelights
                });
        });
    });

//Chercher les yeelights connectées au réseau et les ajouter
//Supprimer toutes les ampoules précedemment stockées
router.route('/yeelights/search')
    .get((req, res)=>
    {
        discover().then((yeelights)=>{
            yeelights.map((yeelight)=>{
                // recreate object without _id field
                let obj ={
                    $set: {
                        'ip': yeelight.ip,
                        'port': yeelight.port,
                        'power': yeelight.power,
                        'bright': yeelight.bright,
                        'colorMode': yeelight.colorMode,
                        'ct': yeelight.ct,
                        'rgb': yeelight.rgb,
                        'hue': yeelight.hue,
                        'sat': yeelight.sat,
                        'name': yeelight.name
                    }
                };
                // update existant bulb or insert new bulb
                Yeelight.findOneAndUpdate({id: yeelight.id}, obj, {upsert: true}, (err) => {
                    if(err) return res.status(500).send({
                        status: 500,
                        message:'bulbs cannot be saved'
                    });
                });
            });
            return res.status(200).send({
                status: 200,
                message:'bulbs discover are successfully saved',
                bulbs: yeelights
            });
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

router.route('/yeelights/:id/toggle')
    .get((req, res)=>
    {
        Yeelight.findOne({id: req.params.id},(err,bulb)=>{
            if(!bulb) return res.status(404).send({
                status: 404,
                message: 'Bulb not referenced on DB try to search on network'
            });
            bulb.toggle().then(()=>{
                return res.status(200).send({
                    status: 200,
                    message: 'Bulb is now :'+ bulb.power
                });
            });
        });
    });
//envoie des couleurs au format RGB {r:,g:,b:}
router.route('/yeelights/:id/rgb')
    .post((req, res)=>
    {
        Yeelight.findOne({id: req.params.id},(err,bulb)=>{
            if(!bulb) return res.status(404).send({
                status: 404,
                message: 'Bulb not referenced on DB try to search on network'
            });
            // envoyer les couleurs à la fonction set_rgb
        });
    });

module.exports = router;
