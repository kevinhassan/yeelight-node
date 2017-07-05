let tcp = require('net');
let socket = new tcp.Socket();

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
        socket.connect(this.port,this.ip, (err) => {
            if(err) return Promise.reject(err);
            socket.write(data);
        });
    }
    toggle(){
        let msg= {
            id: 1,
            method: 'toggle',
            params: ''
        };
        this.send_data(JSON.stringify(msg)+'\r\n');
    }
};

