var arduino = require('./arduino-read').entity;
var kafka = require('./kafka').entity;
var NodeCache = require('node-cache');
var rfid = new NodeCache();
var exportObj = {};

rfid.set('record', []);

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

exportObj.onData = function (data) {
    var rfidRecord = rfid.get('record');
    rfidRecord.push({
        value: parseData(data),
        timestamp: Date.now()
    });
    rfid.set('record', rfidRecord);
};

exportObj.start = function (kafkaUrl) {
    if (!exportObj.isArduinoReady) {
        arduino.generate(this.onData).then(function (status) {
            if (status === "ready") {
                exportObj.isArduinoReady = true;
            }
        });
    }

    if (!exportObj.isKafkaReady) {
        kafka.generate(kafkaUrl).then(function (status) {
            if (status === "ready") {
                exportObj.isKafkaReady = true;
            }
        });
    }
};

exportObj.getServiceStatus = function () {
    return {
        isArduinoReady: this.isArduinoReady,
        isKafkaReady: this.isKafkaReady
    };
};

module.exports.entity = exportObj;