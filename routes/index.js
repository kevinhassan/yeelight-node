const express = require('express');
const router = express.Router();
const Yeelight = require('../models/Yeelight');

let discover = require('../yeelight/discover');

// Fetch all bulbs stored on DB
router.route('/yeelights')
    .get((req, res)=>
    {
        Yeelight.find((err, bulbs)=>{
            if (err){
                res.send(err);
            }
            return bulbs.length === 0 ?
                res.status(404).send({
                    status: 404,
                    message:'No bulb saved'
                }):
                res.status(200).send({
                    status: 200,
                    message:'Fetch bulbs successfully',
                    bulbs: bulbs
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

// Get bulbs
router.route('/yeelights/:id')
    .get((req, res)=>
    {
        Yeelight.findOne({id: req.params.id},(err, bulb)=>{
            if (err){
                res.status(500).send(err);
            }
            return (!bulb || bulb.length === 0) ? res.status(404).send({
                status: 404,
                message: 'Bulb not referenced on DB try to search on network'
            }):
                res.status(200).send({
                    status: 200,
                    message:'Fetch bulb successfully',
                    bulb: bulb
                });
        });
    })
    .delete((req, res)=>{
        Yeelight.remove({id: req.params.id},(err)=>{
            if (err){
                return res.status(500).send(err);
            }
            else{
                return res.status(200).send({
                    status: 200,
                    message:'Bulb successfully removed',
                });
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
//envoie des couleurs au format RGB {red:,green:,blue:}
//pre: req.body.color is an array min : [0,0,0] and max: [255,255,255]
router.route('/yeelights/:id/rgb')
    .post((req, res)=>
    {
        Yeelight.findOne({id: req.params.id},(err,bulb)=>{
            if(!bulb) return res.status(404).send({
                status: 404,
                message: 'Bulb not referenced on DB try to search on network'
            });
            var color = req.body.color;
            if(color && color.hasOwnProperty('red') && color.hasOwnProperty('green') && color.hasOwnProperty('blue') && (color.red <= 255 && color.red >=0) && (color.green <= 255 && color.green >=0) && (color.blue <= 255 && color.blue >=0)){
                bulb.set_power('on', 'smooth', 30).then(()=>{
                    return bulb.set_rgb(req.body.color,'smooth',1000).then(()=>{
                        return res.status(200).send({
                            status: 200,
                            message: 'Bulb\'s color successfully change'
                        });
                    }).catch((err)=>{
                        return err;
                    });
                }).catch((err)=>{
                    return res.status(500).send({
                        status: 500,
                        message: 'Internal error: cannot change bulb\'s color'
                    });
                })
            }else{
                return res.status(400).send({
                    status: 400,
                    message: 'Bad color\'s values'
                });
            }
        });
    });

module.exports = router;
