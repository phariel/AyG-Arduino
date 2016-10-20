var SerialPort = require('serialport');
var port = new SerialPort('/dev/cu.usbmodem1411');
port.on('open', function () {
    port.on('data', function (chunk) {
        console.log(chunk);
    });
});

// open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('Arduino met a problem: ');
    console.log(err.message);
    console.log('=======================');
});