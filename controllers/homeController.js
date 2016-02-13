/**
 * Created by avihay on 1/16/2016.
 */
(function(homeController){

    var db = require('../model/db');
    var finance = require('../model/finance');

    homeController.initPassport = function (app) {
        var passport = require('passport');
        var Strategy = require('passport-http').BasicStrategy;

        passport.serializeUser(function(user, done) {
            done(null, user.username);
        });

        passport.deserializeUser(function(username, done) {
            var user = {username: username, password: "321"};
            done(null, user);
        });

        passport.use(new Strategy(
            function(username, password, cb) {

                if (username === "tomer" && password ==="321"){
                    var user = {username: username, password: password};
                    return cb(null, user);
                }

                return cb(null, false);
            }));
        app.use(passport.initialize());
        app.use(passport.session());
        homeController.passport = passport;
    };

    homeController.getExchangeRate = function (resultsCallback) {
        finance.getExchangeRate(resultsCallback);
    };

    homeController.getOrders = function (identifier, resultsCallback) {
        db.getOrders(identifier, resultsCallback);
    };

    homeController.register = function (socket) {

        console.log("Registered.");
        var screen = 1;
        var messagesToBeDisplayed;
        var seeker = setInterval(function(){
            finance.getExchangeRate(function (err, results){
                console.log("Seeking next val - " + results);
                socket.emit('event', results);
                if (!err)
                    socket.emit('rates', results);
                else
                    console.log("Could not read dollar rate from webservice. Details : " + err);
            });
        }, 400000);

        socket.on('disconnect', function(){
            clearInterval(seeker);
            console.log("SocketIO disconnected.");
        });
    };

})(module.exports);