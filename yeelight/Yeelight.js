let tcp = require('net');
let socket = new tcp.Socket();
const TIMEOUT = 3600;

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
    send_data(data){
        return new Promise((resolve, reject) => {
            socket.connect(this.port,this.ip, (err) => {
                if(err) return reject('connection error');
                socket.write(data, (err) => {
                    if(err) return reject('send error');
                });
            });
            socket.setTimeout(TIMEOUT);
            socket.on('data',(msg) =>{ // First message to confirm command works or not
                msg = JSON.parse(msg);
                if(msg.result !== undefined){
                    isOk(msg)
                        .then(()=> {
                            socket.on('data', (msg)=>{ // Second message to update property changement
                                socket.end();
                                return resolve(JSON.parse(msg));
                            });
                        })
                        .catch(()=> {
                            return reject('no changement');
                        });
                }
            });
            socket.on('timeout',()=>{
                reject('no reponse');
                socket.end();
            });
            socket.on('end',()=>{
                socket.destroy();
            });
        });
    }
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
};

function isOk(msg){
    return msg.result.toString() === 'ok'? Promise.resolve(): Promise.reject();
}

