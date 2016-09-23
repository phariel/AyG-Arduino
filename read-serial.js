var SerialPort = require('serialport');
var port = new SerialPort('/dev/cu.usbmodem1411');

port.on('open', function () {
    port.on('data', function (data) {
        console.log('Data: ' + data);
    });
});

// open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('Error: ', err.message);
});