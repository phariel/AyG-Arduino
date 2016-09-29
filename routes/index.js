var express = require('express');
var router = express.Router();
var core = require('../bridge/core').entity;

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
});

router.post('/start', function (req, res) {
    core.start(req.body.kafkaUrl);
    res.end("{}");
});

router.get('/start-status', function (req, res) {
    var status = core.getServiceStatus();
    res.end(JSON.stringify(status));
});

module.exports = router;
