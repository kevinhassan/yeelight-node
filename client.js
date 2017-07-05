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
    message = message.toString().split('\r\n'); // convert buffer to string and split it with \n character
    console.log(message);
    client.close();
});
