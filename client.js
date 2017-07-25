/**
 * Discover Yeelight connected on the same network
 * Open udp socket and send specific string
 * When builb read this string it send data about its state
 * TODO: Allow the possibility to discover multiple connected bulb
 */
let Yeelight = require('./yeelight/Yeelight');

function discover(){
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
            resolve(data);
        });
        timer = setTimeout(function() {
            reject('no response');
            client.close();
        }, TIMEOUT);
    });
}
/**
 * Parse string to Json to build Yeelight object
 * @param data
 * @returns {{ip: string, port: string, id: string, power: string, bright: string, colorMode: string, ct: string, rgb: string, hue: string, sat: string, name: string}}
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
    let address = data[4].split('//')[1].split(':');
    params.ip = address[0];
    params.port = address[1];
    params.id = data[6].split(' ')[1];
    params.power = data[10].split(' ')[1];
    params.bright = data[11].split(' ')[1];
    params.colorMode = data[12].split(' ')[1];
    params.ct = data[13].split(' ')[1];
    params.rgb = data[14].split(' ')[1];
    params.hue = data[15].split(' ')[1];
    params.sat = data[16].split(' ')[1];
    params.name = data[17].split(' ')[1];
    return params;
}
discover().then((data) => {
    let yeelight = new Yeelight(data);
}).catch( error => {
    switch(error){
    case 'send error':
        console.error('Cannot communicate on the network, please check your internet connection');
        break;
    case 'no response':
        console.error('No response from bulb');
        break;
    }
});
