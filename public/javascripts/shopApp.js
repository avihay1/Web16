/**
 * Created by avihay on 1/15/2016.
 */
var shopApp = angular.module('shopApp', ['ui.odometer','ngRoute']);

shopApp.directive('angularOdometer', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            //Creates new instance of odometer for the element
            new Odometer({el: element[0], value: scope[attrs.odometer]});

            //Watch for changes and update the element value (causing odometer to redraw)
            scope.$watch(attrs.odometer, function(val) {
                element.text(val);
            });

        }
    };
});

shopApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider) {
        $routeProvider
            .when('/items', {
                templateUrl: 'templates/itemList.html',
                controller: 'itemsController'
            })
            .when('/cart', {
                templateUrl: 'templates/cart.html',
                controller: 'cartController'
            }).otherwise({
              redirectTo: '/items'
            });
    }]);
