const mongoose = require('../database/db');
const tcp = require('net');

let Schema = mongoose.Schema;
let nbRequest = 0;

let yeelightSchema = new Schema({
    ip         :
    {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    port       : {
        type: Number,
        required: true
    },
    id         :
    {
        type: String,
        unique: true,
        required: true
    },
    power      :
    {
        type: String,
        lowercase: true,
        required: true,
        validate: {
            validator: function(v){
                return v === 'on' || v === 'off';
            },
            message: '{VALUE} is not valid must be "on" or "off"'
        }
    },
    bright     :
    {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    colorMode  :
    {
        type: Number,
        required: true,
        min: 1,
        max: 3
    },
    ct         :
    {
        type: Number,
        required: true,
        min: 1700,
        max: 6500
    },
    rgb        :
    {
        type: Number,
        required: true,
        min: 0,
        max: 16777215
    },
    hue        :
    {
        type: Number,
        required: true,
        min: 0,
        max: 359
    },
    sat        :
    {
        type: Number,
        required: true,
        min: 0,
        max: 359
    },
    name       :
    {
        type: String,
        default: ''
    }
},{ strict: true });
/**
 * Send data with tcp socket to bulb for execute functions
 * @param data
 * @returns {Promise}
 */
yeelightSchema.methods.send_data = function(data){
    data = JSON.stringify(data)+'\r\n';
    return new Promise((resolve, reject) => {
        let socket = new tcp.Socket();
        socket.connect(this.port,this.ip, (err) => {
            if(err){
                reject('connection error');
                socket.end();
            }
            socket.write(data, (err) => {
                if(err){
                    reject('send error');
                    socket.end();
                }
            });
        });
        socket.on('data',(msg) =>{ // First message to confirm command works or not {"id": n, "result":["ok"]}
            msg = JSON.parse(msg);
            if(msg.error !== undefined){ //{"id": n, "error":[]}
                reject('invalid command');
                socket.end();
            }
            else{
                if(nbRequest>0) nbRequest -= 1;
                resolve(msg);
                socket.end();
            }
        });
        socket.on('end',()=>{
            socket.destroy();
        });
    });
};

/**
 * Method: get_prop
 * Usage: This method is used to retrieve current property of smart LED.
 * Parameters: 1 to N.
 * The parameter is a list of property names and the response contains a
 * list of corresponding property values. If the requested property name is not recognized by
 * smart LED, then a empty string value ("") will be returned.
 * Request Example: {"id":1,"method":"get_prop","params":["power", "not_exist", "bright"]}
 * Response Example: {"id":1, "result":["on", "", "100"]}
 * @param properties
 * @returns {Promise} with params asked updated
 */
yeelightSchema.methods.get_prop = function(...properties){
    let msg = {
        id: nbRequest+1,
        method: 'get_prop',
        params: properties
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then((properties_value)=>{
                properties_value.result.forEach((prop_value, index)=>{
                    if(prop_value !== ''){
                        this[msg.params[index]] = prop_value;
                    }
                });
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: toggle
 * Usage: This method is used to toggle the smart LED.
 * Parameters: 0.
 * Request Example: {"id":1,"method":"toggle","params":[]}
 * Response Example: {"id":1, "result":["ok"]}
 * @returns {Promise}
 */
yeelightSchema.methods.toggle = function(){
    let msg = {
        id: nbRequest+1,
        method: 'toggle',
        params: ''
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                this.power === 'on'? this.power = 'off': this.power = 'on';
                this.save();
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: set_ct_abx
 * Usage: This method is used to change the color temperature of a smart LED.
 * Parameters: 3
 * "ct_value" is the target color temperature. The type is integer and range is 1700 ~ 6500 (k)
 * "effect" support two values: "sudden" and "smooth"
 * "duration" specifies the total time of the gradual changing. The unit is milliseconds > 30ms
 * @param params[ct_value, effect, duration]
 * @returns {Promise}
 */
yeelightSchema.methods.set_ct_abx = function(...params){
    let msg = {
        id: nbRequest+1,
        method: 'set_ct_abx',
        params: params
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                this.ct = msg.params[0]; // Change properties color temperature
                this.save();
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: set_rgb
 * Usage: This method is used to change the color of a smart LED.
 * Parameters: 3.
 * "rgb_value" is the target color, whose type is integer. It should be
 * expressed in decimal integer ranges from 0 to 16777215 (hex: 0xFFFFFF).
 * "effect": Refer to "set_ct_abx" method.
 * "duration": Refer to "set_ct_abx" method.
 * Request Example: {"id":1,"method":"set_rgb","params":[255, "smooth", 500]}
 * Response Example: {"id":1, "result":["ok"]}
 * @param params ({red:,green:,blue:},mode,duration)
 * @returns {Promise}
 */
yeelightSchema.methods.set_rgb = function(...params){
    let msg = {
        id: nbRequest+1,
        method: 'set_rgb',
        params: ''
    };
    nbRequest = msg.id;
    //RGB conversion : RGB = (R*65536) + (G*256) + B
    let color = (params[0].red*65536) + (params[0].green*256) + params[0].blue;
    params[0] = color;
    msg.params = params;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                this.rgb = msg.params[0]; // Change properties color
                this.save();
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: set_hsv
 * Usage: This method is used to change the color of a smart LED.
 * Parameters: 4.
 * "hue" is the target hue value, whose type is integer. It should be
 * expressed in decimal integer ranges from 0 to 359.
 * "sat" is the target saturation value whose type is integer. It's range is 0
 to 100.
 * "effect": Refer to "set_ct_abx" method.

 * "duration": Refer to "set_ct_abx" method.
 * Request Example: {"id":1,"method":"set_hsv","params":[255, 45, "smooth", 500]}
 * Response Example: {"id":1, "result":["ok"]}
 * @param params
 * @returns {Promise}
 */
yeelightSchema.methods.set_hsv = function(...params){
    let msg = {
        id: nbRequest+1,
        method: 'set_hsv',
        params: params
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                this.hue = msg.params[0];
                this.sat = msg.params[1];
                this.save();
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: set_bright
 * Usage: This method is used to change the brightness of a smart LED.
 * Parameters: 3.
 * "brightness" is the target brightness. The type is integer and ranges
 * from 1 to 100. The brightness is a percentage instead of a absolute value. 100 means
 * maximum brightness while 1 means the minimum brightness.
 * "effect": Refer to "set_ct_abx" method.
 * "duration": Refer to "set_ct_abx" method.
 * Request Example: {"id":1,"method":"set_bright","params":[50, "smooth", 500]}
 * @param params
 * @returns {Promise}
 */
yeelightSchema.methods.set_bright = function(...params){
    let msg = {
        id: nbRequest+1,
        method: 'set_bright',
        params: params
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                this.bright = msg.params[0];
                this.save();
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * Method: set_power
 * Usage: This method is used to switch on or off the smart LED (software
 * managed on/off).
 * Parameters: 3.
 * "power" can only be "on" or "off". "on" means turn on the smart LED,
 * "off" means turn off the smart LED.
 * "effect": Refer to "set_ct_abx" method.
 * "duration": Refer to "set_ct_abx" method.
 * Request Example: {"id":1,"method":"set_power","params":["on", "smooth", 500]}
 * @param params
 * @returns {Promise}
 */
yeelightSchema.methods.set_power = function(...params){
    let msg = {
        id: nbRequest+1,
        method: 'set_power',
        params: params
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                this.power = msg.params[0];
                this.save();
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: set_default
 * Usage: This method is used to save current state of smart LED in persistent
 * memory. So if user powers off and then powers on the smart LED again (hard power reset),
 * the smart LED will show last saved state.
 * Parameters: 0.
 * Request Example: {"id":1,"method":"set_default","params":[]}
 * Response Example: {"id":1, "result":["ok"]}
 * @returns {Promise}
 */
yeelightSchema.methods.set_default = function(){
    let msg = {
        id: nbRequest+1,
        method: 'set_default',
        params: []
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: set_adjust
 * Usage: This method is used to change brightness, CT or color of a smart LED
 * without knowing the current value, it's main used by controllers.
 * Parameters: 2.
 * "action" the direction of the adjustment. The valid value can be:
 * “increase": increase the specified property
 * “decrease": decrease the specified property
 * “circle": increase the specified property, after it reaches the max value, go back to minimum value.
 * "prop" the property to adjust. The valid value can be:
 * “bright": adjust brightness.
 * “ct": adjust color temperature.
 * “color": adjust color. (When “prop" is “color", the “action" can only be “circle", otherwise, it will be deemed as invalid request.)
 * Request Example: {"id":1,"method":"set_adjust","params":[“increase", “ct"]}
 * @param params
 * @returns {Promise}
 */
yeelightSchema.methods.set_adjust = function(...params){
    let msg = {
        id: nbRequest+1,
        method: 'set_adjust',
        params: params
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                this.get_prop([msg.params[1]]).then((el)=>{ // update property which changed
                    resolve(el);
                });
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: set_name
 * Usage: This method is used to name the device. The name will be stored on the
 * device and reported in discovering response. User can also read the name through “get_prop" method.
 * Parameters: 1.
 * "name" the name of the device.
 * Request Example: {"id":1,"method":"set_name","params":["my_bulb"]}
 * @param name
 * @returns {Promise}
 */
yeelightSchema.methods.set_name = function(...name){
    let msg = {
        id: nbRequest+1,
        method: 'set_name',
        params: name
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                this.name = msg.params[0];
                this.save();
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: cron_add
 * Usage: This method is used to start a timer job on the smart LED.
 * Parameters: 2.
 * "type" currently can only be 0. (means power off)
 * "value" is the length of the timer (in minutes).
 * Request Example: {"id":1,"method":"cron_add","params":[0, 15]}
 * @param params
 * @returns {Promise}
 */
yeelightSchema.methods.cron_add = function(...params){
    let msg = {
        id: nbRequest+1,
        method: 'cron_add',
        params: params
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                this.power = (params[0] === 0)? 'off': 'on'; // A changer après la temporisation
                this.save();
                resolve(this);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: cron_get
 * Usage: This method is used to retrieve the setting of the current cron job of the
 * specified type.
 * Parameters: 1.
 * "type" the type of the cron job. (currently only support 0).
 * Request Example: {"id":1,"method":"cron_get","params":[0]}
 * @param params
 * @returns {Promise}
 */
yeelightSchema.methods.cron_get = function(...params){
    let msg = {
        id: nbRequest+1,
        method: 'cron_get',
        params: params
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then((cron)=>{
                resolve(cron.result);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};

/**
 * Method: cron_del
 * Usage: This method is used to stop the specified cron job.
 * Parameters: 1.
 * "type" the type of the cron job. (currently only support 0).
 * Request Example: {"id":1,"method":"cron_del","params":[0]}
 * @param params
 * @returns {Promise}
 */
yeelightSchema.methods.cron_del = function(...params){
    let msg = {
        id: nbRequest+1,
        method: 'cron_del',
        params: params
    };
    nbRequest = msg.id;
    return new Promise((resolve)=>{
        this.send_data(msg)
            .then(()=>{
                resolve();
            })
            .catch((err)=>{
                console.error(err);
            });
    });
};
let Yeelight = mongoose.model('Yeelight', yeelightSchema);
module.exports = Yeelight;
