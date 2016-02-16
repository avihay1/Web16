/**
 * Created by avihay on 1/15/2016.
 */
'use strict';

var mongoose = require('mongoose');

var model = {};

(function (model){
    var schemas = {};

    mongoose.connect('mongodb://localhost/Data',
        {/*user: 'dataWriter', pass: 'Aa1234567'*/}
    );
    mongoose.connection.on("error", function(err){
        console.log(err+'ERROR!! Could not connect to database [mongoHandler]');
    });
    mongoose.connection.once("open", function() {
        require('./seed').seedItems();
        console.log("Connected.");
    });

    schemas.poductSchema = new mongoose.Schema({
        name: String,
        price: Number,
        state: {
            type: String,
            validate: {
                validator: function(v) {
                    return /Used|New|Pre/.test(v);
                },
                message: '{VALUE} is not a valid product state!'
            }
        },
        imgUrl: String
    });

    var bestCustomer = "ABC";


    schemas.orderSchema = new mongoose.Schema({
        customerName: String,
        address: {street: String, number: String},
        creditCard: {number: String, exprireDate: String},
        items: [schemas.poductSchema]
    });

    model.Item = mongoose.model('Item', schemas.poductSchema);
    model.Order = mongoose.model('Order', schemas.orderSchema);

    model.addItem = function (item, /*name, price, state, imgUrl,*/ successCallback) {
        new model.Item(item).save(successCallback);
    };

    model.updateItem = function (item, successCallback) {
        model.Item.findOneAndUpdate({"_id": item._id}, item, {}, successCallback);
    };

    model.removeItem = function (id, successCallback){
        model.Item.findOneAndRemove({_id: id}, successCallback);
    };

    model.addOrder = function (order, successCallback) {
        var newOrder = new model.Order(order);

        newOrder.save(successCallback);
    };

    model.getItems = function (identifier, resultsCallback) {
        var identifier = identifier || {};
        model.Item.find(identifier, resultsCallback);
    };

    model.getOrders = function (identifier, resultsCallback) {
        var identifier = identifier || {};
        var resultsCallback = resultsCallback || identifier;
        model.Order.find(identifier, resultsCallback);
    };

    model.getBestCustomer = function (resultsCallback) {
        var bestCutsomer = model.Order.aggregate( [ { $group : { _id : "$items.count", name: {$push: "$$ROOT"} } } ]);
        resultsCallback(null, bestCustomer);
    };
})(module.exports);
