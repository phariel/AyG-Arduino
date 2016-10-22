define(['jquery', 'moment'], function ($, moment) {
    return function () {
        var $start = $('.btn-start');
        var $result = $('.ayg-result');
        var interval;

        var addContent = function (text) {
            $result.css('display', 'block');
            $result.append($('<p></p>').text(text));
        };

        var getUpdatedData = function () {
            interval = setInterval(function () {
                $.get('/updated?_=' + Date.now()).done(function (data) {
                    data.rfid.forEach(function (v) {
                        addContent(
                            'RFID detected [ ID: '
                            + v.value + ' Time: '
                            + moment(v.timestamp).format('MM/DD HH:mm:ss')
                            + ' ]');
                    });
                    data.kafka.forEach(function (v) {
                        addContent(
                            'Kafka response [ Value: '
                            + v.value + ' Time: '
                            + moment(v.timestamp).format('MM/DD HH:mm:ss')
                            + ' ]');
                    });
                });
            }, 1000);
        };

        var getStartStatus = function () {
            $.get('/start-status?_=' + Date.now()).done(function (data) {
                if (data.isArduinoReady) {
                    addContent('Arduino service is ready!');
                }
                if (data.isKafkaReady) {
                    addContent('Kafka service is ready!');
                }
                if (data.isArduinoReady && data.isKafkaReady) {
                    clearInterval(interval);
                    getUpdatedData();
                }
            });
        };

        $start.on('click', function () {
            $.ajax({
                method: 'POST',
                url: '/start',
                dataType: 'json',
                data: {
                    startSignal: true
                }
            }).done(function (data) {
                $start.attr('disabled', 'disabled');
                addContent('Service starting...');
                interval = setInterval(function () {
                    getStartStatus();
                }, 2000);
            });
        });
    }
});