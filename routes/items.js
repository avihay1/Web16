var express = require('express');
var router = express.Router();
var itemCtrl = require('../controllers/itemController');

function successCallback(res) {
  return function (err) {
    res.sendStatus(err ? 500 : 200);
  };
}

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', function (req, res) {
  itemCtrl.getItems(function(err, resource){
    if (!err) res.send(resource);
    else res.sendStatus(500);
  });
});

router.post('/add', function (req, res) {
  itemCtrl.addItem(req.body.item, successCallback(res));
});

router.post('/delete', function (req, res){
  itemCtrl.removeItem(req.body.id, successCallback(res));
});

router.post('/update', function (req, res){
  itemCtrl.updateItem(req.body.item, successCallback(res));
});

module.exports = router;
