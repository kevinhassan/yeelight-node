class Yeelight {
    constructor(data) {
        this._ip = data._ip;
        this._port = data._port;
        this._id = data._id;
        this._power = data._power;
        this._bright = data._bright;
        this._colorMode = data._colorMode;
        this._ct = data._ct;
        this._rgb = data._rgb;
        this._hue = data._hue;
        this._sat = data._sat;
        this._name = data._name;
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
}

