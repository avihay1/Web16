var express = require('express');
var router = express.Router();
var orderCtrl = require('../controllers/orderController');

function successCallback(res) {
    return function (err) {
        res.sendStatus(err ? 500 : 200);
    };
}

router.get('/list', function (req, res) {
    orderCtrl.getOrders(function(err, resource){
        if (!err) res.send(resource);
        else res.sendStatus(500);
    });
});

router.post('/add', function (req, res) {
    orderCtrl.addOrder(req.body.order, successCallback(res));
});

module.exports = router;