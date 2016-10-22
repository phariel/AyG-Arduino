var kafka = require('kafka-node-slim');
var when = require('when');
var config = require('../config.json');

var Producer = kafka.Producer;
var payloads = [
    {topic: 'lot', messages: ''}
];
var producer;
var exportObj = {};

var errorHandle = function (err) {
    console.log('Kafka met a problem: ');
    console.log(err);
    console.log('=====================');
};

var printData = function (data) {
    console.log('Kafka send: ');
    console.log(data);
    console.log('=====================');
};

exportObj.generate = function (sendCallback) {
    console.log(config.kafkaUrl);
    var client = new kafka.Client(config.kafkaUrl);
    var generateDeferred = when.defer();

    exportObj.isReady = false;
    producer = new Producer(client);
    producer.on('ready', function () {
        generateDeferred.resolve('ready');
        exportObj.isReady = true;
        exportObj.send = function (dataJson) {
            dataJson = JSON.stringify(dataJson);
            payloads[0].messages = dataJson;

            printData(JSON.stringify(payloads));

            producer.send(payloads, function (err, data) {
                if (err) {
                    errorHandle(err);
                } else {
                    sendCallback(data);
                }
            });
        };
    });

    producer.on('error', function (err) {
        errorHandle(err);
    });

    return generateDeferred.promise;
};


module.exports.entity = exportObj;


