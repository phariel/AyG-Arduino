var kafka = require('kafka-node');
var when = require('when');

var Producer = kafka.Producer;
var payloads = [
    {topic: 'lot', messages: ''}
];
var producer;
var exportObj = {};

exportObj.generate = function (clientUrl) {
    var client = new kafka.Client(clientUrl);
    var generateDeferred = when.defer();

    exportObj.isReady = false;
    producer = new Producer(client);
    producer.on('ready', function () {
        generateDeferred.resolve('ready');
        exportObj.isReady = true;
        exportObj.send = function (dataArray) {
            var sendPromise = when.promise();

            payloads.messages = JSON.stringify(dataArray);
            producer.send(payloads, function (err, data) {
                if (err) {
                    sendPromise.reject(err);
                } else {
                    sendPromise.resolve(data);
                }
            });

            return sendPromise;
        };
    });

    producer.on('error', function (err) {
        console.log('Kafka met a problem: ');
        console.log(err);
        console.log('====================');
    });

    return generateDeferred.promise;
};


module.exports.entity = exportObj;


