(function () {
    'use strict';
    var baseApi = "http://localhost:3000"

    angular.module('ShoppingList', ['ngResource'])

        .controller('ToBuyController', ToBuyController)
        .controller('AlreadyBoughtController', AlreadyBoughtController)
        .service('ShoppingListService', ShoppingListService)
        .factory('Groceries', function($resource) {
            return $resource(baseApi + '/groceries', {}, {
                query: {method: 'GET', isArray: true},
                create: {method: 'POST'}
            })
        })
        .factory('Grocery', function($resource) {
            return $resource(baseApi + "/groceries/:id.json", { id: '@id' }, {
                delete: { method: 'DELETE', params: {id: '@id', responseType: 'json'} }
            })
        })
        .constant('ApiBAsePath', "http://localhost:3000")
        .constant ('maxItems', 100);


        ToBuyController.$inject = ['$scope','ShoppingListService', '$resource', 'Groceries', 'Grocery', '$location'];
        function ToBuyController($scope, ShoppingListService, $resource, Groceries, Grocery, $location) {
        var tobuylist = this;

        getOnlineList();

        tobuylist.moveItem = function (itemIndex) {
            //delete item from the database
            $scope.deleteGrocery(tobuylist.items[itemIndex]['id'])
            //move item to already bought list
            ShoppingListService.moveItem(itemIndex);
        };

        async function getOnlineList() {
            await fetch(baseApi + '/groceries')
                .then (res => res.json())
                .then((data) => {
                    ShoppingListService.tobuylist = data;
                    tobuylist.items = ShoppingListService.getTuBuyItems();
                    $scope.$apply();
                })
                .catch(err => { throw err });
            console.log('Checkout getOnlineList JSON! ', tobuylist.items);

        };

        //$scope.groceries = Groceries.query();
        $scope.deleteGrocery = function (grocery_id) {
            Grocery.delete({ id: grocery_id }, function(){
                //$scope.groceries = Groceries.query();
                //$location.path('/');
                //$scope.$apply();
            });
        };

        tobuylist.itemName = "";
        tobuylist.itemQuantity = "";

        tobuylist.addItem = function () {
            ShoppingListService.addItem(tobuylist.itemName, tobuylist.itemQuantity);
            ShoppingListService.saveItem(tobuylist.itemName, tobuylist.itemQuantity)
        }

    }

    AlreadyBoughtController.$inject = ['ShoppingListService'];
    function AlreadyBoughtController(ShoppingListService) {
        var boughtlist = this;

        boughtlist.items = ShoppingListService.getBoughtItems();

    }

    ShoppingListService.$inject = ['Groceries']
    function ShoppingListService(Groceries, maxItems) {
        var service = this;

        // List of shopping items
        service.tobuylist = [];
        service.boughtlist = [];

        service.moveItem = function (itemIndex) {
            var item = service.tobuylist[itemIndex];
            service.boughtlist.push(item);
            service.tobuylist.splice(itemIndex, 1);
        };

        service.getBoughtItems = function () {
            return service.boughtlist;
        };

        service.getTuBuyItems = function () {
            return service.tobuylist;
        };

        service.addItem = function (itemName, quantity) {
            if ((maxItems === undefined) ||
                (maxItems !== undefined) && (service.tobuylist.length < maxItems)) {
                var item = {
                    name: itemName,
                    quantity: quantity
                };
                service.tobuylist.push(item);
            }
            else {
                throw new Error("Max items (" + maxItems + ") reached.");
            }
        };

        service.saveItem = function(itemName, itemQuantity) {
            var grocery = { grocery: { grocery_name: itemName, quantity: itemQuantity }};
            Groceries.create({ grocery: { grocery_name: itemName, quantity: itemQuantity }}, function(){
                console.log(grocery)
                //$location.path('/');
                //$scope.$apply();
            });
        };
    }


})();