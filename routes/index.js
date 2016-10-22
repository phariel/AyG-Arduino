var express = require('express');
var router = express.Router();
var core = require('../bridge/core').entity;

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
});

router.post('/start', function (req, res) {
    core.start(req.body.startSignal);
    res.end("{}");
});

router.get('/start-status', function (req, res) {
    var status = core.getServiceStatus();
    res.json(status);
});

router.get('/updated', function (req, res) {
    var data = core.getUpdatedData();
    res.json(data);
});

module.exports = router;
