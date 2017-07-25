let discover = require('./yeelight/discover').discover;

discover().then((yeelights) => {
  console.log(yeelights);
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
