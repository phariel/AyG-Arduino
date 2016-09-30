var kafka = require('kafka-node');
var when = require('when');

var Producer = kafka.Producer;
var payloads = [
    {topic: 'lot', messages: ''}
];
var producer;
var exportObj = {};

var errorHandle = function (err) {
    console.log('Kafka met a problem: ');
    console.log(err);
    console.log('====================');
};

exportObj.generate = function (clientUrl, sendCallback) {
    var client = new kafka.Client(clientUrl);
    var generateDeferred = when.defer();

    exportObj.isReady = false;
    producer = new Producer(client);
    producer.on('ready', function () {
        generateDeferred.resolve('ready');
        exportObj.isReady = true;
        exportObj.send = function (dataJson) {
            payloads.messages = JSON.stringify(dataJson);
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


