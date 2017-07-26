const express = require('express');
const router = express.Router();

let discover = require('../yeelight/discover');

router
.get('/discover',(req,res)=>
    {
        discover().then((yeelights)=>{
            res.status(200).send(yeelights);
        });
    });

module.exports = router;
