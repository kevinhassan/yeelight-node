let tcp = require('net');

module.exports = class Yeelight {
    constructor(data) {
        this._ip = data.ip;
        this._port = data.port;
        this._id = data.id;
        this._power = data.power;
        this._bright = data.bright;
        this._colorMode = data.colorMode;
        this._ct = data.ct;
        this._rgb = data.rgb;
        this._hue = data.hue;
        this._sat = data.sat;
        this._name = data.name;
        this._nbRequest = 0;
    }
    get ip() {
        return this._ip;
    }

    set ip(value) {
        this._ip = value;
    }

    get port() {
        return this._port;
    }

    set port(value) {
        this._port = value;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get power() {
        return this._power;
    }

    set power(value) {
        this._power = value;
    }

    get bright() {
        return this._bright;
    }

    set bright(value) {
        this._bright = value;
    }

    get colorMode() {
        return this._colorMode;
    }

    set colorMode(value) {
        this._colorMode = value;
    }

    get ct() {
        return this._ct;
    }

    set ct(value) {
        this._ct = value;
    }

    get rgb() {
        return this._rgb;
    }

    set rgb(value) {
        this._rgb = value;
    }

    get hue() {
        return this._hue;
    }

    set hue(value) {
        this._hue = value;
    }

    get sat() {
        return this._sat;
    }

    set sat(value) {
        this._sat = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }
    get nbRequest() {
        return this._nbRequest;
    }

    set nbRequest(value) {
        this._nbRequest = value;
    }
    /**
     * Send data with tcp socket to bulb for execute functions
     * @param data
     * @returns {Promise}
     */
    send_data(data){
        console.log(data);
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
                    if(this.nbRequest>0) this.nbRequest -= 1;
                    resolve(msg);
                    socket.end();
                }
            });
            socket.on('end',()=>{
                socket.destroy();
            });
        });
    }

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
     * @returns {Promise}
     */
    get_prop(...properties){
        let msg = {
            id: this.nbRequest+1,
            method: 'get_prop',
            params: properties
        };
        this.nbRequest = msg.id;
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
    }

    /**
     * Method: toggle
     * Usage: This method is used to toggle the smart LED.
     * Parameters: 0.
     * Request Example: {"id":1,"method":"toggle","params":[]}
     * Response Example: {"id":1, "result":["ok"]}
     * @returns {Promise}
     */
    toggle(){
        let msg = {
            id: this.nbRequest+1,
            method: 'toggle',
            params: ''
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    this.power === 'on'? this.power = 'off': this.power = 'on';
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

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
    set_ct_abx(...params){
        let msg = {
            id: this.nbRequest+1,
            method: 'set_ct_abx',
            params: params
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    this.ct = msg.params[0]; // Change properties color temperature
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }
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
     * @param params
     * @returns {Promise}
     */
    set_rgb(...params){
        let msg = {
            id: this.nbRequest+1,
            method: 'set_rgb',
            params: ''
        };
        this.nbRequest = msg.id;
        //RGB conversion : RGB = (R*65536) + (G*256) + B
        params[2] = (params[0]*65536) + (params[1]*256) + params[2];
        msg.params = params.slice(2);
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    this.rgb = msg.params[0]; // Change properties color
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

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
    set_hsv(...params){
        let msg = {
            id: this.nbRequest+1,
            method: 'set_hsv',
            params: params
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    this.hue = msg.params[0];
                    this.sat = msg.params[1];
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

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
    set_bright(...params){
        let msg = {
            id: this.nbRequest+1,
            method: 'set_bright',
            params: params
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    this.bright = msg.params[0];
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

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
    set_power(...params){
        let msg = {
            id: this.nbRequest+1,
            method: 'set_power',
            params: params
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    this.power = msg.params[0];
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

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
    set_default(){
        let msg = {
            id: this.nbRequest+1,
            method: 'set_default',
            params: []
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

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
    set_adjust(...params){
        let msg = {
            id: this.nbRequest+1,
            method: 'set_adjust',
            params: params
        };
        this.nbRequest = msg.id;
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
    }

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
    set_name(...name){
        let msg = {
            id: this.nbRequest+1,
            method: 'set_name',
            params: name
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    this.name = msg.params[0];
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

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
    cron_add(...params){
        let msg = {
            id: this.nbRequest+1,
            method: 'cron_add',
            params: params
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    this.power = (params[0] === 0)? 'off': 'on'; // A changer après la temporisation
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

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
    cron_get(...params){
        let msg = {
            id: this.nbRequest+1,
            method: 'cron_get',
            params: params
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then((cron)=>{
                    resolve(cron.result);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

    /**
     * Method: cron_del
     * Usage: This method is used to stop the specified cron job.
     * Parameters: 1.
     * "type" the type of the cron job. (currently only support 0).
     * Request Example: {"id":1,"method":"cron_del","params":[0]}
     * @param params
     * @returns {Promise}
     */
    cron_del(...params){
        let msg = {
            id: this.nbRequest+1,
            method: 'cron_del',
            params: params
        };
        this.nbRequest = msg.id;
        return new Promise((resolve)=>{
            this.send_data(msg)
                .then(()=>{
                    resolve();
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }
};
