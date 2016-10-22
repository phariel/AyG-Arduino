var SerialPort = require('serialport');
var config = require('./config.json');
var port = new SerialPort(config.serialPort);

port.on('open', function () {
    port.on('data', function (chunk) {
        console.log(chunk.toString('utf8'));
    });
});

// open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('Arduino met a problem: ');
    console.log(err.message);
    console.log('=======================');
});