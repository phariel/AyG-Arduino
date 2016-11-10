var arduino = require('./arduino-read').entity;
var kafka = require('./kafka').entity;
var NodeCache = require('node-cache');
var rfid = new NodeCache();
var config = require('../config.json');
var exportObj = {};
var lastTimeRfid;
var lastTimeKafka;

const RECORD = 'record';
const KAFKA_RESPONSE = 'kafkaResponse';

rfid.set(RECORD, []);
rfid.set(KAFKA_RESPONSE, []);

var kafkaSend = function (data) {
    var sendData = {
        rfidTagId: data,
        locationId: config.locationId,
        timestamp: Date.now()
    };
    kafka.send(sendData);
};

var kafkaSendCallback = function (data) {
    var kafkaResponse = rfid.get(KAFKA_RESPONSE);

    kafkaResponse.push({
        value: JSON.stringify(data),
        timestamp: Date.now()
    });

    rfid.set(KAFKA_RESPONSE, kafkaResponse);
};

var updatedDataFilter = function (type) {
    var rfidRecord = rfid.get(type);
    var returnValue;
    var temp = [];

    if (type === RECORD) {
        if (!lastTimeRfid) {
            returnValue = rfidRecord;
        } else {
            rfidRecord.forEach(function (v) {
                if (v.timestamp > lastTimeRfid) {
                    temp.push(v);
                }
            });
            returnValue = temp;
        }

        if (rfidRecord.length > 0) {
            lastTimeRfid = rfidRecord[rfidRecord.length - 1].timestamp;
        }
    }

    if (type === KAFKA_RESPONSE) {
        if (!lastTimeKafka) {
            returnValue = rfidRecord;
        } else {

            rfidRecord.forEach(function (v) {
                if (v.timestamp > lastTimeKafka) {
                    temp.push(v);
                }
            });
            returnValue = temp;
        }

        if (rfidRecord.length > 0) {
            lastTimeKafka = rfidRecord[rfidRecord.length - 1].timestamp;
        }
    }

    return returnValue;
};

exportObj.onData = function (data) {
    var rfidRecord = rfid.get(RECORD);

    kafkaSend(data);

    rfidRecord.push({
        value: data,
        timestamp: Date.now()
    });
    rfid.set(RECORD, rfidRecord);
};

exportObj.start = function (signal) {
    if (signal) {
        if (!exportObj.isArduinoReady) {
            arduino.generate(this.onData).then(function (status) {
                if (status === "ready") {
                    exportObj.isArduinoReady = true;
                }
            });
        }

        if (!exportObj.isKafkaReady) {
            kafka.generate(kafkaSendCallback).then(function (status) {
                if (status === "ready") {
                    exportObj.isKafkaReady = true;
                }
            });
        }
    }
};

exportObj.getServiceStatus = function () {
    return {
        isArduinoReady: this.isArduinoReady,
        isKafkaReady: this.isKafkaReady
    };
};

exportObj.getUpdatedData = function () {
    return {
        rfid: updatedDataFilter(RECORD),
        kafka: updatedDataFilter(KAFKA_RESPONSE)
    }
};

module.exports.entity = exportObj;