define(['jquery', 'moment'], function ($, moment) {
    return function () {
        var $url = $('.text-kafka');
        var $start = $('.btn-start');
        var $result = $('.ayg-result');
        var $location = $('.text-location');
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

        var parseInputValue = function ($input) {
            var val = $input.val();
            if (val.length === 0) {
                val = $input.attr('placeholder');
            }
            return val;
        };

        $start.on('click', function () {
            $.ajax({
                method: 'POST',
                url: '/start',
                dataType: 'json',
                data: {
                    kafkaUrl: parseInputValue($url),
                    locationId: parseInputValue($location)
                }
            }).done(function (data) {
                $start.attr('disabled', 'disabled');
                $url.attr('disabled', 'disabled');
                $location.attr('disabled', 'disabled');
                addContent('Service starting...');
                interval = setInterval(function () {
                    getStartStatus();
                }, 2000);
            });
        });
    }
});