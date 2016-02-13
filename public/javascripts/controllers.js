/**
 * Created by avihay on 1/15/2016.
 */
var controllers = {};

controllers.cartController = function ($scope){

    $scope.removeItem = function (item) {
        $scope.shared.cart.splice($scope.shared.cart.indexOf(item), 1);
        $scope.shared.totalPrice = (+$scope.shared.totalPrice - item.price).toFixed(2);
    };

    $scope.emptyCart = function () {
        $scope.shared.cart = [];
        $scope.shared.totalPrice = 0;
    };

    $scope.purchase = function(){
        var creditCardPattern = new RegExp("^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$");

        if (creditCardPattern.test($('.credit-card').val().replace(/-/g,''))){
            $('#buyModal').modal('hide');
            $(".progress").show();
        } else {
            alert("Invalid credit card number");
        }
    }
};

controllers.itemsController = function ($scope) {
    $scope.items = $scope.shared.items || [];

    $scope.addToCart = function (item) {
        $scope.shared.cart.push(item);
        $scope.shared.totalPrice = (+$scope.shared.totalPrice + item.price).toFixed(2);
    };
};

controllers.homeController = function ($scope, $http) {
    $scope.rate = {dollar: 3.54};
    if (!$scope.shared.cart ) {
        $scope.shared.cart = [];
        $scope.shared.totalPrice = 0;
    }
    $scope.items = $scope.shared.items || [];

    if ($scope.items.length === 0) {
        $http.get('items').success(function (items) {
            $scope.items = [];
            for (var i = 0; i < items.length; i++) {
                items[i].id = i;
                items[i].priceCalculated = (items[i].price * $scope.rate.dollar).toFixed(2);
                $scope.items.push(items[i]);
                $scope.shared.items = $scope.items;
            }
        });
    }

    $scope.login = function () {
      window.location = '/admin';
    };

    $scope.$watch('rate.dollar', function () {
        console.log("Dollar rate changed!");
        if ($scope.items) {
            $scope.items.forEach(function (item) {
                item.priceCalculated = (item.price * $scope.rate.dollar).toFixed(2);
            });
        }
    });

    var socket = io('http://localhost:3000');
    function handleRateChange(newRate) {
        $scope.rate.dollar = +newRate;
        $scope.$apply();
    }

    socket.on('connect', function(){console.log("Client connected");});
    socket.on('disconnect', function(){console.log("Client disconnected");});
    socket.on('rates', handleRateChange);
};


shopApp.controller(controllers);