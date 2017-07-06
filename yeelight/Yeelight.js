let tcp = require('net');
const TIMEOUT = 3;

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

    /**
     * Send data with tcp socket to bulb for execute functions
     * @param data
     * @returns {Promise}
     */
    send_data(data){
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
            socket.on('data',(msg) =>{ // First message to confirm command works or not
                msg = JSON.parse(msg);
                console.log(msg);
                if(msg.error !== undefined){
                    reject('invalid command');
                    socket.end();
                }
                else{
                    socket.setTimeout(TIMEOUT);
                    socket.on('data', (msg)=>{ // Second message to update property changement
                        socket.end();
                        resolve(JSON.parse(msg));
                    });
                }
            });
            socket.on('timeout',()=>{
                reject('no changement');
                socket.end();
            });
            socket.on('end',()=>{
                socket.destroy();
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
            id: 1,
            method: 'toggle',
            params: ''
        };
        return new Promise((resolve)=>{
            this.send_data(JSON.stringify(msg)+'\r\n',this)
                .then((updated_msg)=>{
                    this.power = updated_msg.params.power; // Change properties power
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
    set_ct_abx(params){
        let msg = {
            id: 1,
            method: 'set_ct_abx',
            params: params
        };
        return new Promise((resolve)=>{
            this.send_data(JSON.stringify(msg)+'\r\n',this)
                .then((updated_msg)=>{
                    this.ct = updated_msg.params.ct; // Change properties color temperature
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }
    // Method: set_rgb
    // Usage: This method is used to change the color of a smart LED.
    // Parameters: 3.
    // "rgb_value" is the target color, whose type is integer. It should be
    // expressed in decimal integer ranges from 0 to 16777215 (hex: 0xFFFFFF).
    // "effect": Refer to "set_ct_abx" method.
    // "duration": Refer to "set_ct_abx" method.
    // Request Example: {"id":1,"method":"set_rgb","params":[255, "smooth", 500]}
    // Response Example: {"id":1, "result":["ok"]}
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
    set_rgb(params){
        let msg = {
            id: 1,
            method: 'set_rgb',
            params: ''
        };
        //RGB conversion : RGB = (R*65536) + (G*256) + B
        params[0] = (params[0][0]*65536) + (params[0][1]*256) + params[0][2];
        msg.params = params;
        return new Promise((resolve)=>{
            this.send_data(JSON.stringify(msg)+'\r\n',this)
                .then((updated_msg)=>{
                    this.rgb = updated_msg.params.rgb; // Change properties color
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }

    set_hsv(params){
        let msg = {
            id: 1,
            method: 'set_hsv',
            params: params
        };
        return new Promise((resolve)=>{
            this.send_data(JSON.stringify(msg)+'\r\n',this)
                .then((updated_msg)=>{
                    console.log(updated_msg);
                    resolve(this);
                })
                .catch((err)=>{
                    console.error(err);
                });
        });
    }
};

