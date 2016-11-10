var SerialPort = require('serialport');
var when = require('when');
var config = require('../config.json');
var exportObj = {};

var hexToString = function (data) {
    var val = '';
    var arr = data.split(':');
    arr.forEach(function (v) {
        if (v !== "20") {
            val += String.fromCharCode(parseInt(v, 16));
        }
    });
    return val;
};

var parseData = function (data) {
    var r = /\[(.+?)\]/g;
    data = data.match(r);
    data = data[0].replace('[', '').replace(']', '');
    return hexToString(data);
};

exportObj.generate = function (callback) {
    var generateDeferred = when.defer();
    var data = "";

    exportObj.isReady = false;
    var port = new SerialPort(config.serialPort);
    port.on('open', function () {
        exportObj.isReady = true;
        generateDeferred.resolve('ready');
        port.on('data', function (chunk) {
            data += chunk.toString('utf8');
            if (config.isLongRangeRfid) {
                data = data.substring(1, data.length - 1);
                callback(data);
                data = "";
            } else {
                if (data.indexOf(']') > -1) {
                    data = parseData(data);
                    callback(data);
                    data = "";
                }
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