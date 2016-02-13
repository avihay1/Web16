/**
 * Created by avihay on 1/16/2016.
 */
(function(seed){

    var db = require('./db');

    function insertSeedItems() {
        var seedItems = [{
            "id" : 1,
            "name": "iPhone 6S",
            "price": 360,
            "state": "Used",
            "imgUrl": "No-Image"
        }, {
            "id" : 2,
            "name": "Rubber Duck",
            "price": 9.99,
            "state": "New",
            "imgUrl": "http://free-icon-download.com/modules/PDdownloads/images/screenshots/free-icon-download-rubber-duck-illustration.png"
        }, {
            "id" : 3,
            "name": "F16",
            "price": 1000,
            "state": "Pre-War",
            "imgUrl": "http://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/F16_drawing.svg/766px-F16_drawing.svg.png"
        }, {
            "id" : 4,
            "name": "Moldova",
            "price": 0.3,
            "state": "Used",
            "imgUrl": "http://wwwnc.cdc.gov/travel/images/map-moldova.png"
        }, {
            "id" : 5,
            "name": "Bowl of Rice",
            "price": 1.3,
            "state": "Newly Cooked",
            "imgUrl": "http://www.wpcsd.k12.ny.us/cms/lib5/NY01000029/Centricity/Domain/955/12456948171194366574johnny_automatic_bowl_of_rice_svg_hi.png"
        }, {
            "id" : 6,
            "name": "Pass this course",
            "price": 20,
            "state": "New",
            "imgUrl": "http://www.happymelly.com/wp/wp-content/uploads/2014/11/one-hundred.png"
        }, {
            "id" : 7,
            "name": "Left Kidney",
            "price": 19.99,
            "state": "Recently Used",
            "imgUrl": "http://beanstersbytes.com/wp-content/uploads/2013/03/Kidney_Bean.png"
        }, {
            "id" : 8,
            "name": "Nobel Prize",
            "price": 92.03,
            "state": "New",
            "imgUrl": "http://www.literaturereviewhq.com/wp-content/uploads/2013/12/Nobel_medal.png"
        }, {
            "id" : 9,
            "name": "Apartment in Tel Aviv",
            "price": 999999,
            "state": "Used",
            "imgUrl": "http://a.dilcdn.com/bl/wp-content/uploads/sites/8/2013/03/box-empty.jpg"
        }, {
            "id" : 10,
            "name": "One Dollar Bill",
            "price": 1,
            "state": "New",
            "imgUrl": "http://upload.wikimedia.org/wikipedia/commons/9/96/US_one_dollar_bill,_reverse,_series_2009.jpg"
        }];

        for (var i = 0; i < seedItems.length; i++){
            var currSeedItem = new db.Item(seedItems[i]);
            currSeedItem.save(function (err){if (!err){console.log("Added seed item to db"); }});
        }
    }

    seed.seedItems = function () {
        db.Item.findOne({}, function (err, results) {
            if (!err) {
                if (!results) {
                    console.log("Seeding db...");
                    insertSeedItems();
                } else {
                    console.log("Database already seeded");
                }
            } else {
                console.log("Could not seed database. Details: " + err);
            }
        });
    };

})(module.exports);