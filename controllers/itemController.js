/**
 * Created by avihay on 1/28/2016.
 */
(function(itemController) {
    var db = require('../model/db');

    itemController.getItems = function (identifier, resultsCallback) {
        // Validate the data ...
        db.getItems(identifier, resultsCallback);
    };

    itemController.addItem = function (item, successCallback) {
        // Validate the data ...
        db.addItem(item, successCallback);
    };

    itemController.updateItem = function (item, successCallback) {
        // Validate the data ...
        db.updateItem(item, successCallback);
    };

    itemController.removeItem = function (id, successCallback) {
        db.removeItem(id, successCallback);
    };

})(module.exports);