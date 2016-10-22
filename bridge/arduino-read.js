var SerialPort = require('serialport');
var when = require('when');
var config = require('../config.json');
var exportObj = {};

exportObj.generate = function (callback) {
    var generateDeferred = when.defer();
    var data = "";

    exportObj.isReady = false;
    var port = new SerialPort(config.serialPort);
    port.on('open', function () {
        exportObj.isReady = true;
        generateDeferred.resolve('ready');
        port.on('data', function (chunk) {
            data += chunk;
            if (data.indexOf(']') > -1) {
                callback(data);
                data = "";
            }
        });
    });

// open errors will be emitted as an error event
    port.on('error', function (err) {
        console.log('Arduino met a problem: ');
        console.log(err.message);
        console.log('=======================');
    });

    return generateDeferred.promise;
};


module.exports.entity = exportObj;