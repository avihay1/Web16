var express = require('express');
var router = express.Router();
var orderCtrl = require('../controllers/orderController');

function successCallback(res) {
    return function (err) {
        res.sendStatus(err ? 500 : 200);
    };
}

function resultsCallback(res) {
    return function (err, resource) {
        if (!err) res.send(resource);
        else res.sendStatus(500);
    };
}

router.get('/list', function (req, res) {
    orderCtrl.getOrders(resultsCallback(res));
});

router.post('/add', function (req, res) {
    orderCtrl.addOrder(req.body.order, successCallback(res));
});

router.get('/bestCustomer', function (req, res) {
    orderCtrl.getBestCustomer(resultsCallback(res))
});
module.exports = router;