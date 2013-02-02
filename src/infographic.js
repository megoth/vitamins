/*global _, $, d3, document, window*/
(function (global, underscore, jQuery, d3) {
    'use strict';

    global.Infographic = function (categories, vitamins, food, order, size) {
        var processedVitamins = this.processVitamins(vitamins),
            processedFood = this.processFood(food, processedVitamins),
            processedCategories = this.processCategories(categories);
        this.toggledFood = {};
        this.toggledVitamins = {};
        this.mediator = new global.Infographic.Mediator(food, vitamins);
        this.values = this.populate(vitamins, processedFood, processedCategories, order);
        this.Paint = new global.Infographic.Paint(this.values, size);
    };
    global.Infographic.Mediator = function (food, vitamins) {
        this.terminal = {};
        food.concat(vitamins).forEach(function (i) {
            this.terminal[i.key] = [];
        }.bind(this));
    };
    global.Infographic.Mediator.prototype.connect = function (point, node) {
        var result = this.terminal[point] ? this.terminal[point].push(node) : 0;
        return result;
    };
    global.Infographic.Mediator.prototype.keys = function () {
        return Object.keys(this.terminal);
    };
    global.Infographic.Mediator.prototype.size = function () {
        return this.keys().reduce(function (memo, key) {
            return memo + this.terminal[key].length;
        }.bind(this), 0);
    };
    global.Infographic.Mediator.prototype.update = function (point, val) {
        this.terminal[point].forEach(function (node) {
            node.update(val);
        });
    };
    global.Infographic.Node = function (mediator, vitamin, processedFood, processedCategories, order, index, size) {
        var category = order[index],
            food = this.findFood(category, vitamin.key, processedFood),
            isStartLabel = index === -1,
            isEndLabel = index === size;
        this.focusCount = 0;
        if (isStartLabel || isEndLabel) {
            this.label = vitamin.key;
            this.html = vitamin.html;
            this["default"] = underscore.clone(processedCategories.label["default"]);
            this.focus = underscore.clone(processedCategories.label.focus);
            this.foodCount = 1;
            mediator.connect(vitamin.key, this);
        } else {
            this.label = food.reduce(function (memo, food) { return memo + food.label; }, "");
            this.html = food.reduce(function (memo, food) { return memo + '<img src="' + food.html + '" />'; }, "");
            this["default"] = processedCategories[category]["default"];
            this.focus = processedCategories[category].focus;
            this.food = food;
            this.foodCount = food.length;
            food.forEach(function (f) {
                mediator.connect(f.key, this);
            }.bind(this));
        }
        if (!isEndLabel) {
            this.children = [new global.Infographic.Node(mediator, vitamin, processedFood, processedCategories, order, index + 1, size)];
        }
    };
    global.Infographic.Node.prototype.findFood = function (category, vitaminKey, processedFood) {
        return Object.keys(processedFood).map(function (key) {
            return processedFood[key];
        }).filter(function (food) {
            return food.category === category && food.vitamin[vitaminKey];
        }).concat([]);
    };
    global.Infographic.Node.prototype.update = function (value) {
        this.focusCount += value;
        return this.focusCount;
    };
    global.Infographic.Paint = function (data, size) {
        this.size = size;
        this.radius = size / 2;
        this.svg = global.Infographic.Paint.getSvg(size);
        this.vis = global.Infographic.Paint.getVis(this.svg, this.radius);
        this.x = global.Infographic.Paint.getX();
        this.y = global.Infographic.Paint.getY(this.radius);
        this.partition = global.Infographic.Paint.getPartition();
        this.nodes = global.Infographic.Paint.getNodes(this.partition, data);
        this.arc = global.Infographic.Paint.getArc(this.x, this.y);
        this.path = global.Infographic.Paint.getPath(this.vis, this.nodes, this.arc);
        this.text = global.Infographic.Paint.getText(this.vis, this.nodes, this.x, this.y);
    };
    global.Infographic.Paint.prototype.updateData = function (data) {
        this.vis = global.Infographic.Paint.getVis(this.svg, this.radius);
        this.nodes = global.Infographic.Paint.getNodes(this.partition, data);
        this.path = global.Infographic.Paint.getPath(this.vis, this.nodes, this.arc);
        this.text = global.Infographic.Paint.getText(this.vis, this.nodes, this.x, this.y);
    };
    global.Infographic.Paint.getArc = function (x, y) {
        return d3.svg.arc()
            .startAngle(function (d) {
                return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
            })
            .endAngle(function (d) {
                return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
            })
            .innerRadius(function (d) {
                return Math.max(0, d.y ? y(d.y) : d.y);
            })
            .outerRadius(function (d) {
                return Math.max(0, y(d.y + d.dy));
            });
    };
    global.Infographic.Paint.getColor = function (d, type, fallback) {
        if (!d["default"]) {
            return fallback;
        }
        return d.focusCount > 0 ? d.focus[type] : d["default"][type];
    };
    global.Infographic.Paint.getNodes = function (partition, data) {
        return partition
            .nodes({ children: data });
    };
    global.Infographic.Paint.getPartition = function () {
        return d3.layout.partition()
            .sort(function (a, b) {
                return b.value - a.value;
            })
            .value(function (d) {
                return 5.8 - d.depth;
            });
    };
    global.Infographic.Paint.getPath = function (vis, nodes, arc) {
        return vis
            .selectAll("path")
            .data(nodes)
            .enter()
            .append("path")
            .attr("id", function (d, i) { return "path-" + i; })
            .attr("d", arc)
            .attr("fill-rule", "evenodd")
            .style("fill", function (d) {
                return global.Infographic.Paint.getColor(d, "background-color", "#fff");
            })
            .style("stroke", function (d) {
                return d3.hsl(global.Infographic.Paint.getColor(d, "background-color", "#fff")).darker();
            });
    };
    global.Infographic.Paint.getSvg = function (size) {
        return d3.select("#Infographic")
            .append("svg")
            .attr("height", size)
            .attr("width", size);
    };
    global.Infographic.Paint.getText = function (vis, nodes, x, y) {
        return vis
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .style("fill-opacity", 1)
            .style("fill", function (d) {
                return global.Infographic.Paint.getColor(d, "color", "#fff");
            })
            .attr("font-size", function (d) {
                return 8 + d.depth;
            })
            .attr("text-anchor", function (d) {
                return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
            })
            .attr("dy", "-1em")
            .attr("transform", function (d) {
                var rotate = x(d.x + d.dx / 2) * 180 / Math.PI - 90;
                return "rotate(" + rotate + ")translate(" + (y(d.y)) + ")rotate(90)";
            })
            .append("tspan")
            .attr("x", function (d) {
                return d.foodCount / 2 * (13 + d.depth) * (x(d.x + d.dx / 2) > Math.PI ? 1 : -1);
            })
            .text(function (d) {
                return d.label;
            });
    };
    global.Infographic.Paint.getVis = function (svg, radius) {
        return svg
            .append("g")
            .attr("transform", "translate(" + [radius, radius] + ")");
    };
    global.Infographic.Paint.getX = function () {
        return d3.scale.linear()
            .range([0, 2 * Math.PI]);
    };
    global.Infographic.Paint.getY = function (radius) {
        return d3.scale.pow()
            .exponent(1.3)
            .domain([0, 1])
            .range([0, radius]);
    };
    global.Infographic.prototype.findVitamin = function (vitamins, foodVitamin) {
        var vitamin = {};
        Object.keys(vitamins).forEach(function (key) {
            vitamin[key] = false;
        });
        foodVitamin.forEach(function (key) {
            vitamin[key] = true;
        });
        return vitamin;
    };
    global.Infographic.prototype.populate = function (vitamins, processedFood, categories, order) {
        return vitamins.map(function (vitamin) {
            return new global.Infographic.Node(this.mediator, vitamin, processedFood, categories, order, -1, order.length);
        }.bind(this));
    };
    global.Infographic.prototype.processCategories = function (categories) {
        var categoryObject = {};
        categories.forEach(function (object) {
            categoryObject[object.key] = object;
        });
        return categoryObject;
    };
    global.Infographic.prototype.processFood = function (food, processedVitamins) {
        var foodObject = {};
        food.forEach(function (f) {
            foodObject[f.key] = underscore.extend({
                "vitamin": this.findVitamin(processedVitamins, f.vitamins)
            }, f);
        }.bind(this));
        return foodObject;
    };
    global.Infographic.prototype.processVitamins = function (vitamins) {
        var processedVitamins = {};
        vitamins.forEach(function (vitamin) {
            processedVitamins[vitamin.key] = vitamin;
        });
        return processedVitamins;
    };
    global.Infographic.prototype.toggleFood = function (food) {
        this.toggledFood[food.key] = this.toggledFood[food.key] ? (this.toggledFood[food.key] + 1) % 2 : 1;
        this.mediator.update(food.key, this.toggledFood[food.key] === 0 ? -1 : 1);
        food.vitamins.forEach(function (vitamin) {
            this.toggledVitamins[vitamin] += this.toggledVitamins[vitamin] ? this.toggledFood[food.key] === 0 ? -1 : 1 : 1;
            this.mediator.update(vitamin, this.toggledVitamins[vitamin] === 0 ? -1 : 1);
        }.bind(this));
        this.Paint.updateData(this.values);
    };
    global.UserInput = function (order, food) {
        this.values = order.map(function (category) {
            return {
                "name": category,
                "food": this.findFood(category, food)
            };
        }.bind(this));
    };
    global.UserInput.prototype.findFood = function (category, food) {
        return Object.keys(food).filter(function (key) {
            return food[key].category === category;
        });
    };
}(document || window, _, $, d3));
