let message = new Buffer('M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1982\r\nMAN: "ssdp:discover"\r\nST: wifi_bulb\r\n')
let PORT = 1982;
let HOST = '239.255.255.250';

let dgram = require('dgram');

let client = dgram.createSocket('udp4');

client.send(message, 0, message.length, PORT, HOST, function(err) {
    if (err) throw err;
    console.log('UDP message sent to ' + HOST +':'+ PORT);
});
client.on('listening', function () {
    let address = client.address();
    console.log('UDP Server listening on ' + address.address + ':' + address.port);
});
client.on('message', function (message, remote) {

    console.log(remote.address + ':' + remote.port +' - ' + message);
    extract_data(message);
    client.close();
});

function extract_data(data){
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
    // param.ip = data
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