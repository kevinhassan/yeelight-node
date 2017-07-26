/**
 * Discover Yeelight connected on the same network
 * Open udp socket and send specific string
 * When builb read this string it send data about its state
 */

let discover = function(){
    let Yeelight = require('./Yeelight');
    let yeelights = [];
    let udp = require('dgram');
    const PORT = 1982;
    const HOST = '239.255.255.250';
    let msg = 'M-SEARCH * HTTP/1.1\r\nHOST: '+HOST+':'+PORT+'\r\nMAN: "ssdp:discover"\r\nST: wifi_bulb\r\n';
    let data = {};
    let client = udp.createSocket('udp4');
    let timer;
    const TIMEOUT = 3600;

    return new Promise((resolve, reject) => {
        client.send(msg, 0, msg.length, PORT, HOST, (err)=>{
            if(err) reject('send error');
        });
        client.on('message', function (msg) {
            clearTimeout(timer);
            client.close();
            data = parse(msg);
            yeelights.push(new Yeelight(data));
            resolve(yeelights);
        });
        timer = setTimeout(function() {
            reject('no response');
            client.close();
        }, TIMEOUT);
    });
};
/**
 * Parse string to Json to build Yeelight object
 * @param data
 * @returns {ip: string, port: string, id: string, power: string, bright: string, colorMode: string, ct: string, rgb: string, hue: string, sat: string, name: string}
 */
function parse(data){
    let params = {
        ip:'',
        port:'',
        id:'',
        power:'',
        bright:'',
        colorMode:'',
        ct:'',
        rgb:'',
        hue:'',
        sat:'',
        name:''
    };
    data = data.toString().split('\r\n'); // convert buffer to string and split it with \n character
    data = data.splice(4);
    let address = data.shift().split('//')[1].split(':');
    params.ip = address[0];
    params.port = address[1];
    data = data.splice(1);
    params.id = data.shift().split(' ')[1];
    data = data.splice(3);
    params.power = data.shift().split(' ')[1];
    params.bright = data.shift().split(' ')[1];
    params.colorMode = data.shift().split(' ')[1];
    params.ct = data.shift().split(' ')[1];
    params.rgb = data.shift().split(' ')[1];
    params.hue = data.shift().split(' ')[1];
    params.sat = data.shift().split(' ')[1];
    params.name = data.shift().split(' ')[1];
    return params;
}

module.exports = discover;
