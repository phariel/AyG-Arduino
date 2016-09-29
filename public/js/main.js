var $url = $('.text-kafka');
var $start = $('.btn-start');
var $result = $('.ayg-result');
var interval;

var addContent = function (text) {
    $result.css('display', 'block');
    $result.append($('<p></p>').text(text));
};

var getStartStatus = function () {
    $.get('/start-status?_=' + Date.now()).done(function (data) {
        data = JSON.parse(data);
        if (data.isArduinoReady) {
            addContent('Arduino service is ready!');
        }
        if (data.isKafkaReady) {
            addContent('Kafka service is ready!');
        }
        if (data.isArduinoReady && data.isKafkaReady) {
            clearInterval(interval);
        }
    });
};

$start.on('click', function () {
    var url = $url.val();
    if (url.length === 0) {
        url = $url.attr('placeholder');
    }
    if (url.length > 0) {
        $.ajax({
            method: 'POST',
            url: '/start',
            dataType: 'json',
            data: {
                kafkaUrl: url
            }
        }).done(function (data) {
            $start.attr('disabled', 'disabled');
            $url.attr('disabled', 'disabled');
            addContent('Service starting...');
            interval = setInterval(function () {
                getStartStatus();
            }, 2000);
        });
    }
});