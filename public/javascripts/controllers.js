/**
 * Created by avihay on 1/15/2016.
 */
var controllers = {};

controllers.cartController = function ($scope, $uibModal){
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
        $uibModal.open({
            animation: true,
            templateUrl: 'purchaseModal.html',
            controller: 'purchaseModalController'
        });

    };


    // DEBUG ONLY
   /* $scope.addToCart = function (item) {
        $scope.shared.cart.push(item);
        $scope.shared.totalPrice = (+$scope.shared.totalPrice + item.price).toFixed(2);
    };

    $scope.addToCart($scope.shared.items[0]);*/

};

controllers.purchaseModalController = function($scope, $uibModalInstance, $http){
    $scope.order = {};
    $scope.error = "";
    function validateClientInformation()
    {
        //var creditCardPattern = new RegExp("^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$");
        var creditCardPattern = new RegExp("^[0-9]+$");
        var clientNamePattern = new RegExp("^[a-zA-Zà-ú ]+$");
        var clientAddressPattern = new RegExp("^[0-9a-zA-Zà-ú ]+$");
        return (clientNamePattern.test($scope.order.clientName) &&
                clientAddressPattern.test($scope.order.clientAddress) &&
                creditCardPattern.test($scope.order.creditCard));
    }

    $scope.buy = function () {
        $scope.error = "";
        if (validateClientInformation()) {
            $uibModalInstance.close();
            $scope.order.items = $scope.shared.cart;
            $http.post('/orders/add', {order: $scope.order}).
                then(
                function successCallback() {
                    $scope.result = "Purchase completed successfully";
                    alert($scope.result);
                },
                function errorCallback(response) {
                    $scope.result = "The purchase could not be done at the moment. (" + response.status + ")";
                    alert($scope.result);
                });
        } else {
            $scope.error = "Invalid information.";
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
};

controllers.itemsController = function ($scope, $location, $http) {
    $scope.search = {};
    $scope.items = $scope.shared.items || [];
    $scope.filteredItems = $scope.items.slice(0);

    $scope.filterItems = function () {
        $scope.filteredItems = $scope.items.slice(0);
        if (!$scope.search.name && !$scope.search.state && (!$scope.search.price && $scope.search.price != 0)) return;
        for (var i = 0; i < $scope.items.length; i++) {
            if (
                !((!$scope.search.name || ($scope.search.name && $scope.items[i].name.toLowerCase().indexOf($scope.search.name.toLowerCase()) != -1)) &&
                (!$scope.search.state || ($scope.search.state && $scope.items[i].state.indexOf($scope.search.state) != -1)) &&
                ((!$scope.search.price && $scope.search.price != 0) || $scope.items[i].price == $scope.search.price))
            )
                $scope.filteredItems.splice( $scope.filteredItems.indexOf($scope.items[i]), 1);
        }
    };

    $scope.addToCart = function (item) {
        $scope.shared.cart.push(item);
        $scope.shared.totalPrice = (+$scope.shared.totalPrice + item.price).toFixed(2);
    };

    $scope.update = function (item) {
        $location.path("/modifyItem/"+$scope.shared.items.indexOf(item));
    };

    $scope.createItem = function () {
        $location.path("/modifyItem/?");
    };

    $scope.delete = function (item) {
        var res = confirm("Are you sure you want to permanently delete " + item.name + "?");
        if (res)
            $http.post("items/delete", {id: item._id}).then(function (response) {
                alert("Deleted successfully!");
                var index = $scope.shared.items.indexOf(item);
                $scope.shared.items.splice(index, 1);
                $scope.items = $scope.shared.items;
                $scope.filteredItems = $scope.items.slice(0);
            }, function () {
                alert("Could not delete item!");
            });
    }
};

controllers.homeController = function ($scope, $http) {
    $scope.shared.rate = $scope.rate = {dollar: 3.54};
    $scope.loading = true;

    if (!$scope.shared.cart ) {
        $scope.shared.cart = [];
        $scope.shared.totalPrice = 0;
    }
    $scope.items = $scope.shared.items || [];

    if ($scope.items.length === 0) {
        $http.get('items/list').then(function (response) {
            $scope.loading = false;
            var items = response.data;
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
        //console.log("Dollar rate changed!");
        if ($scope.items) {
            $scope.items.forEach(function (item) {
                item.priceCalculated = (item.price * $scope.rate.dollar).toFixed(2);
            });
        }
    });

    var socket = io('http://localhost:3000');
    function handleRateChange(newRate) {
        $scope.shared.rate.dollar = $scope.rate.dollar = +newRate;
        $scope.$apply();
    }

    socket.on('connect', function(){console.log("Client connected");});
    socket.on('disconnect', function(){console.log("Client disconnected");});
    socket.on('rates', handleRateChange);
};

controllers.graphController = function ($scope, $http) {
    var tooltip;
    var dim;
    d3.select(window).on('resize', function () {
        dim = { width: window.innerWidth * 0.8, height: window.innerHeight * 0.65 };
    });

    $http.get('/orders/list').then(function (response) {
        var orders = response.data;
        init_graph(orders, $scope.shared.items);
    });

    function toggleTooltip(action, data)
    {
        var margin_top = d3.select("svg").attr("height") + $(document).height();
        var margin_left = d3.select("svg").attr("width") + $(document).width();
        tooltip.style("visibility", action)
            .style("left", (data.x + margin_left) + "px")
            .style("top", (data.y + margin_top) + "px");


        tooltip.text(data.name);
        tooltip.append("br");
        tooltip.append("img")
            .attr("src", data.picture)
            .attr("style", "width: 5em; height: 5em");
    }


    function init_graph(orders, items) {
        if (!orders || !orders.length || orders.length == 0 ||
            !items || !items.length || items.length == 0 )
            return;

        tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .attr("type", "tooltip")
            .text("a simple tooltip")
            .append("img").attr("type", "tooltipImage");

        tooltip = d3.select("[type = 'tooltip']");

        var parsed_data = { "nodes": [], "links": [] };
        var vItems = {};
        for (var i = 0; i < items.length; i++) {
            var vIndex = parsed_data.nodes.push({ "x": i, "y": i, "name": items[i].name, "picture": items[i].imgUrl, "fill": "red"}) - 1;
            vItems[items[i]._id] = { "vIndex": vIndex };
        }

        for (var j = 0; j < orders.length; j++)
        {
            var vIndex = parsed_data.nodes.push({ "x": j, "y": j, "name": orders[j].customerName, "picture": "images/customer.png", "fill": "blue"}) - 1;
            for (var k = 0; k < orders[j].items.length; k++) {
                if (vItems[orders[j].items[k]._id]) {
                    parsed_data.links.push({
                        "source": vItems[orders[j].items[k]._id].vIndex,
                        "target": vIndex
                    });
                }
            }
        }

        selectableForceDirectedGraph(parsed_data);
    }

    function selectableForceDirectedGraph(graph_data) {
        var width = 960,
            height = 500,
            shiftKey, ctrlKey;

        var nodeGraph = null;
        var xScale = d3.scale.linear()
            .domain([0, width]).range([0, width]);
        var yScale = d3.scale.linear()
            .domain([0, height]).range([0, height]);

        var svg = d3.select("#d3_selectable_force_directed_graph")
            .attr("tabindex", 1)
            .on("keydown.brush", keydown)
            .on("keyup.brush", keyup)
            .each(function () { this.focus(); })
            .append("svg")
            .attr("width", width)
            .attr("height", height);



        var zoomer = d3.behavior.zoom().
            scaleExtent([0.1, 10]).
            x(xScale).
            y(yScale).
            on("zoomstart", zoomstart).
            on("zoom", redraw);

        function zoomstart() {
            node.each(function (d) {
                d.selected = false;
                d.previouslySelected = false;
            });
            node.classed("selected", false);
        }

        function redraw() {
            vis.attr("transform",
                "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        }

        var brusher = d3.svg.brush()
            //.x(d3.scale.identity().domain([0, width]))
            //.y(d3.scale.identity().domain([0, height]))
            .x(xScale)
            .y(yScale)
            .on("brushstart", function (d) {
                node.each(function (d) {
                    d.previouslySelected = shiftKey && d.selected;
                });
            })
            .on("brush", function () {
                var extent = d3.event.target.extent();

                node.classed("selected", function (d) {
                    return d.selected = d.previouslySelected ^
                        (extent[0][0] <= d.x && d.x < extent[1][0]
                        && extent[0][1] <= d.y && d.y < extent[1][1]);
                });
            })
            .on("brushend", function () {
                d3.event.target.clear();
                d3.select(this).call(d3.event.target);
            });

        var svg_graph = svg.append('svg:g')
            .call(zoomer);
        //.call(brusher)

        var rect = svg_graph.append('svg:rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')
            //.attr('opacity', 0.5)
            .attr('stroke', 'transparent')
            .attr('stroke-width', 1)
            //.attr("pointer-events", "all")
            .attr("id", "zrect");

        var brush = svg_graph.append("g")
            .datum(function () { return { selected: false, previouslySelected: false }; })
            .attr("class", "brush");

        var vis = svg_graph.append("svg:g");

        vis.attr('fill', 'red')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('opacity', 0.5)
            .attr('id', 'vis');


        brush.call(brusher)
            .on("mousedown.brush", null)
            .on("touchstart.brush", null)
            .on("touchmove.brush", null)
            .on("touchend.brush", null);

        brush.select('.background').style('cursor', 'auto');

        var link = vis.append("g")
            .attr("class", "link")
            .selectAll("line");

        var node = vis.append("g")
            .attr("class", "node")
            .selectAll("circle");

        center_view = function () {
            // Center the view on the molecule(s) and scale it so that everything
            // fits in the window

            if (nodeGraph === null)
                return;

            var nodes = nodeGraph.nodes;

            //no molecules, nothing to do
            if (nodes.length === 0)
                return;

            // Get the bounding box
            min_x = d3.min(nodes.map(function (d) { return d.x; }));
            min_y = d3.min(nodes.map(function (d) { return d.y; }));

            max_x = d3.max(nodes.map(function (d) { return d.x; }));
            max_y = d3.max(nodes.map(function (d) { return d.y; }));


            // The width and the height of the graph
            mol_width = max_x - min_x;
            mol_height = max_y - min_y;

            // how much larger the drawing area is than the width and the height
            width_ratio = width / mol_width;
            height_ratio = height / mol_height;

            // we need to fit it in both directions, so we scale according to
            // the direction in which we need to shrink the most
            min_ratio = Math.min(width_ratio, height_ratio) * 0.8;

            // the new dimensions of the molecule
            new_mol_width = mol_width * min_ratio;
            new_mol_height = mol_height * min_ratio;

            // translate so that it's in the center of the window
            x_trans = -(min_x) * min_ratio + (width - new_mol_width) / 2;
            y_trans = -(min_y) * min_ratio + (height - new_mol_height) / 2;


            // do the actual moving
            vis.attr("transform",
                "translate(" + [x_trans, y_trans] + ")" + " scale(" + min_ratio + ")");

            // tell the zoomer what we did so that next we zoom, it uses the
            // transformation we entered here
            zoomer.translate([x_trans, y_trans]);
            zoomer.scale(min_ratio);

        };

        function dragended(d) {
            //d3.select(self).classed("dragging", false);
            node.filter(function (d) { return d.selected; })
                .each(function (d) { d.fixed &= ~6; })

        }

        insertData(0, graph_data);
        function insertData (error, graph) {
            nodeGraph = graph;

            graph.links.forEach(function (d) {
                d.source = graph.nodes[d.source];
                d.target = graph.nodes[d.target];
            });

            link = link.data(graph.links).enter().append("line")
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });


            var force = d3.layout.force()
                .charge(-120)
                .linkDistance(30)
                .nodes(graph.nodes)
                .links(graph.links)
                .size([width, height])
                .start();

            function dragstarted(d) {
                d3.event.sourceEvent.stopPropagation();
                if (!d.selected && !shiftKey) {
                    // if this node isn't selected, then we have to unselect every other node
                    node.classed("selected", function (p) { return p.selected = p.previouslySelected = false; });
                }

                d3.select(this).classed("selected", function (p) { d.previouslySelected = d.selected; return d.selected = true; });

                node.filter(function (d) { return d.selected; })
                    .each(function (d) { d.fixed |= 2; })
            }

            function dragged(d) {
                node.filter(function (d) { return d.selected; })
                    .each(function (d) {
                        d.x += d3.event.dx;
                        d.y += d3.event.dy;

                        d.px += d3.event.dx;
                        d.py += d3.event.dy;
                    });

                force.resume();
            }
            node = node.data(graph.nodes).enter().append("circle")
                .attr("r", 4)
                .attr("fill", function(d) {return d.fill;})
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .attr("name", function (d) { return d.name; })
                .attr("picture", function (d) { return d.picture;})
                .on("dblclick", function (d) { d3.event.stopPropagation(); })
                .on("click", function (d) {
                    if (d3.event.defaultPrevented) return;

                    if (!shiftKey) {
                        //if the shift key isn't down, unselect everything
                        node.classed("selected", function (p) { return p.selected = p.previouslySelected = false; })
                    }

                    // always select this node
                    d3.select(this).classed("selected", d.selected = !d.previouslySelected);
                })
                .on("mouseover", function (d) { toggleTooltip("visible",d); })
                .on("mouseout", function (d) { toggleTooltip("hidden", d); })

                .on("mouseup", function (d) {
                    //if (d.selected && shiftKey) d3.select(this).classed("selected", d.selected = false);
                })
                .call(d3.behavior.drag()
                    .on("dragstart", dragstarted)
                    .on("drag", dragged)
                    .on("dragend", dragended));

            function tick() {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node.attr('cx', function (d) { return d.x; })
                    .attr('cy', function (d) { return d.y; });

            };

            force.on("tick", tick);

        };


        function keydown() {
            shiftKey = d3.event.shiftKey || d3.event.metaKey;
            ctrlKey = d3.event.ctrlKey;

            console.log('d3.event', d3.event);

            if (d3.event.keyCode == 67) {   //the 'c' key
                center_view();
            }

            if (shiftKey) {
                svg_graph.call(zoomer)
                    .on("mousedown.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null);

                //svg_graph.on('zoom', null);
                vis.selectAll('g.gnode')
                    .on('mousedown.drag', null);

                brush.select('.background').style('cursor', 'crosshair');
                brush.call(brusher);
            }
        }

        function keyup() {
            shiftKey = d3.event.shiftKey || d3.event.metaKey;
            ctrlKey = d3.event.ctrlKey;

            brush.call(brusher)
                .on("mousedown.brush", null)
                .on("touchstart.brush", null)
                .on("touchmove.brush", null)
                .on("touchend.brush", null);

            brush.select('.background').style('cursor', 'auto');
            svg_graph.call(zoomer);
        }
    }
};

controllers.modifyItemController = function ($scope, $routeParams, $http) {
    var target = "items/";
    if (!$routeParams.itemId || isNaN(+$routeParams.itemId + 1)) {
        $scope.item = {};
        target += "add";
    }
    else {
        $scope.item = $scope.shared.items[+$routeParams.itemId];
        target += "update";
    }

    $scope.saveChanges = function () {
        $http.post(target, {item: $scope.item}).then(function (response) {
            $scope.error = $scope.result = "";
            $scope.item.id = $scope.shared.items.length;
            $scope.shared.items.push($scope.item);
            $scope.result = "Successfully saved.";
        }, function () {
            $scope.error = $scope.result = "";
            $scope.error = "Could not save. Try again later.";
        });
    }
};

controllers.ordersController = function ($scope, $http) {

    $http.get('orders/list').then(function (response) {
        $scope.loading = false;
        var orders = response.data;
        $scope.orders = [];

        var itemIdToPrice = {};

        // Map item to price
        for (var i = 0; i < $scope.shared.items.length; i++){
            itemIdToPrice[$scope.shared.items[i]._id] = $scope.shared.items[i].price;
        }

        for (var i = 0; i < orders.length; i++) {
            var totalPrice = 0;
            orders[i].id = i;

            for (var j = 0; j < orders[i].items.length; j++) {
                totalPrice += itemIdToPrice[orders[i].items[j]._id];
            }

            orders[i].calculatedTotalPrice = (totalPrice * $scope.shared.rate.dollar).toFixed(2);
            orders[i].totalPrice = totalPrice.toFixed(2);
            $scope.orders.push(orders[i]);
        }

        $scope.filteredOrders = $scope.orders.slice(0);
    });


    $scope.filterOrders = function () {
        $scope.filteredOrders = $scope.orders.slice(0);
        if (!$scope.search.customerName &&
            (!$scope.search.totalPrice && $scope.search.totalPrice != 0) &&
            (!$scope.search.claculatedTotalPrice && $scope.search.claculatedTotalPrice != 0)) return;

        for (var i = 0; i < $scope.orders.length; i++) {

            if (($scope.search.customerName && $scope.orders[i].customerName.toLowerCase().indexOf($scope.search.customerName.toLowerCase()) == -1) ||
                (($scope.search.totalPrice || $scope.search.totalPrice == 0) && $scope.orders[i].totalPrice != $scope.search.totalPrice) ||
                (($scope.search.calculatedTotalPrice || $scope.search.calculatedTotalPrice == 0) && $scope.orders[i].calculatedTotalPrice != $scope.search.calculatedTotalPrice)){
                $scope.filteredOrders.splice( $scope.filteredOrders.indexOf($scope.orders[i]), 1);
            }
        }
    };

};

controllers.statisticsController = function ($scope, $http) {
    $http.get('orders/bestCustomer').then(function (response) {
        $scope.result = response.data;
    }, function () {
        $scope.result = "Could not fetch data.";
    })
};

controllers.empty = function () {};

shopApp.controller(controllers);