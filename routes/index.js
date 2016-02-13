var express = require('express');
var router = express.Router();
var db = require('../model/db');
var homeCtrl = require('../controllers/homeController');

/* GET home page. */



function respondWithResource(err, resource, res) {
  if (!err) res.send(resource);
  else res.sendStatus(500);
}

router.get('/', function(req, res, next) {
  var loggedIn = !!req.user;
  res.render('index', {title: 'stam', user: loggedIn});
});

router.get('/items', function (req, res){

});

router.get('/rate', function (req, res) {
  homeCtrl.getExchangeRate(function (err, resource){
      if (!err) res.send(resource);
      else res.sendStatus(500);
  });
});

router.get('/admin', homeCtrl.passport.authenticate('basic', { session: true }), function(req, res) {
  var loggedIn = !!req.user;
  var title = loggedIn ? 'Welcome ' + req.user.username + '!' : 'Welcome';
  res.render('index', {title: title, user: loggedIn});
  //res.redirect('/');
});

router.get('/logout', function (req, res){
  req.logout();
  var loggedIn = !!req.user;
  res.render('index', {title: 'Home', user: loggedIn});
});

module.exports = router;
