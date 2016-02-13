(function(orderController) {
    var db = require('../model/db');

    orderController.getOrders = function (identifier, resultsCallback) {
        // Validate the data ...
        db.getOrders(identifier, resultsCallback);
    };

    orderController.addOrder = function (order, successCallback) {
        // Validate the data ...
        db.addOrder(order, successCallback);
    };

})(module.exports);