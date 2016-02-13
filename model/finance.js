/**
 * Created by avihay on 1/16/2016.
 */
(function(finance){

    finance.getExchangeRate = function (resultsCallback) {
        var https = require('https');
        https.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDILS%22)&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback=', function (res){
            var data = '';
            res.on('data', function (chunk){
                data += chunk.toString();
            });
            res.on('end', function () {
                resultsCallback(null, JSON.parse(data).query.results.rate.Rate);
            });
        });
    };
})(module.exports);