/*global _, assert, buster, define, document, Infographic, refute, sinon, window */
(function (global, _) {
    "use strict";
    var vitamins = [
            {
                "key": "A",
                "html": "A"
            },
            {
                "key": "B1",
                "html": "B<sup>1</sup>"
            }
        ],
        categories = [
            {
                "key": "label",
                "default": {
                    "background-color": "#000000",
                    "color": "#ffffff"
                },
                "focus": {
                    "background-color": "#000000",
                    "color": "#ff0000"
                }
            },
            {
                "key": "meat",
                "default": {
                    "background-color": "#ec5a87",
                    "color": "#c21565"
                },
                "focus": {
                    "background-color": "#c21565",
                    "color": "#ec5a87"
                }
            },
            {
                "key": "vegetables",
                "default": {
                    "background-color": "#b2d59d",
                    "color": "#449666"
                },
                "focus": {
                    "background-color": "#449666",
                    "color": "#b2d59d"
                }
            }
        ],
        food = [
            {
                "name": "Carrot",
                "key": "carrot",
                "label": "C",
                "html": "icon-carrot",
                "category": "vegetables",
                "vitamins": [ "A" ]
            },
            {
                "name": "Red meat",
                "key": "red-meat",
                "label": "RM",
                "html": "icon-red-meat",
                "category": "meat",
                "vitamins": [ "A", "B1" ]
            },
            {
                "name": "Soy",
                "key": "soy",
                "label": "S",
                "html": "icon-soy",
                "category": "vegetables",
                "vitamins": [ "B1" ]
            },
            {
                "name": "Sweet potatoes",
                "key": "sweet-potatoes",
                "label": "SP",
                "html": "icon-sweet-potatoes",
                "category": "vegetables",
                "vitamins": [ "A" ]
            }
        ],
        order = [
            "vegetables",
            "meat"
        ];
    buster.testCase("Infographic", {
        setUp: function () {
            this.infographic = new global.Infographic(categories, vitamins, food, order);
        },
        "An object is returned": function () {
            assert.defined(this.infographic);
            assert.isObject(this.infographic);
        },
        "The object has a worked array": function () {
            assert.defined(this.infographic.values);
        },
        "The first dimension should equal number of vitamins": function () {
            assert.equals(this.infographic.values.length, Object.keys(vitamins).length);
        },
        "Infographic.findVitamin": {
            setUp: function () {
                var processedVitamins = this.infographic.processVitamins(vitamins);
                this.vitamins = this.infographic.findVitamin(processedVitamins, food[0].vitamins);
            },
            "Should return an object": function () {
                assert.isObject(this.vitamins);
            }
        },
        "Infographic.Mediator": {
            setUp: function () {
                this.mediator = new global.Infographic.Mediator(food, vitamins);
            },
            "Returns an object": function () {
                assert.isObject(this.mediator);
            },
            "Infographic.Mediator.keys": {
                setUp: function () {
                    this.keys = this.mediator.keys();
                },
                "Object holds as many points as food": function () {
                    assert.equals(this.keys.length, food.length + vitamins.length);
                },
                "Holds correct values": function () {
                    var keys = food.concat(vitamins).map(function (i) {
                        return i.key;
                    });
                    assert.equals(this.keys, keys);
                }
            },
            "Infographic.Mediator.connect": {
                setUp: function () {
                    this.index1 = this.mediator.connect("carrot", {});
                    this.index2 = this.mediator.connect("carrot", {});
                    this.index3 = this.mediator.connect("red-meat", {});
                },
                "Index returned new size for point": function () {
                    assert.equals(this.index1, 1);
                    assert.equals(this.index2, 2);
                    assert.equals(this.index3, 1);
                }
            },
            "Infographic.Mediator.size": {
                setUp: function () {
                    this.mediator.connect("carrot", {});
                    this.mediator.connect("red-meat", {});
                },
                "Returns the number of connections": function () {
                    assert.equals(this.mediator.size(), 2);
                }
            },
            "Infographic.Mediator.update": {
                setUp: function () {
                    this.spy = sinon.spy(function (val) {
                        this.focusCount += val;
                        return this.focusCount;
                    });
                    this.obj1 = { focusCount: 0, update: this.spy };
                    this.obj2 = { focusCount: 0, update: this.spy };
                    this.obj3 = { focusCount: 0, update: this.spy };
                    this.obj4 = { focusCount: 0, update: this.spy };
                    this.mediator.connect("carrot", this.obj1);
                    this.mediator.connect("carrot", this.obj2);
                    this.mediator.connect("red-meat", this.obj3);
                    this.mediator.connect("A", this.obj4);
                    this.mediator.update("carrot", 1);
                },
                "All affected objects are updated": function () {
                    assert.equals(this.obj1.focusCount, 1);
                    assert.equals(this.obj2.focusCount, 1);
                    assert.equals(this.obj3.focusCount, 0);
                    assert.equals(this.obj4.focusCount, 0);
                },
                "Spy are called": function () {
                    assert.called(this.spy);
                    assert.equals(this.spy.callCount, 2);
                }
            }
        },
        "Infographic.Node": {
            setUp: function () {
                this.processedVitamins = this.infographic.processVitamins(vitamins);
                this.processedCategories = this.infographic.processCategories(categories);
                this.processedFood = this.infographic.processFood(food, this.processedVitamins);
                this.mediator = new global.Infographic.Mediator(food, vitamins);
                this.node = new global.Infographic.Node(this.mediator, this.processedVitamins.A, this.processedFood, this.processedCategories, order, 0, order.length);
            },
            "An object is returned": function () {
                assert.isObject(this.node);
            },
            "The object has correct values": function () {
                delete this.node.children;
                assert.equals(this.node, {
                    "default": this.processedCategories.vegetables["default"],
                    "focus": this.processedCategories.vegetables.focus,
                    "label": "CSP",
                    "html": '<img src="icon-carrot" /><img src="icon-sweet-potatoes" />',
                    "food": this.node.findFood(order[0], "A", this.processedFood),
                    "foodCount": 2,
                    "focusCount": 0
                });
            },
            "The object has correct number of children": function () {
                assert.equals(this.node.children.length, 1);
            },
            "Mediator is updated": function () {
                assert.equals(this.infographic.mediator.size(), 9);
            },
            "Infographic.findFood": {
                setUp: function () {
                    this.foodFound = this.node.findFood(order[0], "A", this.processedFood);
                },
                "An array is returned": function () {
                    assert.equals(this.foodFound.length, 2);
                },
                "A has correct values": function () {
                    assert.equals(this.foodFound, [
                        this.processedFood.carrot,
                        this.processedFood["sweet-potatoes"]
                    ]);
                }
            },
            "Infographic.update": {
                setUp: function () {
                    this.result = this.node.update(1);
                },
                "Return the new value of focusCount": function () {
                    assert.equals(this.result, 1);
                },
                "FocusCount is updated": function () {
                    assert.equals(this.node.focusCount, 1);
                }
            },
            "StartNode": {
                setUp: function () {
                    this.node = new global.Infographic.Node(this.mediator, this.processedVitamins.A, this.processedFood, this.processedCategories, order, -1, order.length);
                },
                "An object is returned": function () {
                    assert.isObject(this.node);
                },
                "The object has correct values": function () {
                    delete this.node.children;
                    assert.equals(this.node, {
                        "default": this.processedCategories.label["default"],
                        "focus": this.processedCategories.label.focus,
                        "html": "A",
                        "label": "A",
                        "foodCount": 1,
                        "focusCount": 0
                    });
                },
                "The object has one child": function () {
                    assert.equals(this.node.children.length, 1);
                }
            },
            "EndNode": {
                setUp: function () {
                    this.node = new global.Infographic.Node(this.mediator, this.processedVitamins.A, this.processedFood, this.processedCategories, order, 2, order.length);
                },
                "An object is returned": function () {
                    assert.isObject(this.node);
                },
                "The object has correct values": function () {
                    assert.equals(this.node, {
                        "default": this.processedCategories.label["default"],
                        "focus": this.processedCategories.label.focus,
                        "html": "A",
                        "label": "A",
                        "foodCount": 1,
                        "focusCount": 0
                    });
                },
                "The object has no children": function () {
                    refute.defined(this.node.children);
                }
            }
        },
        "Infographic.populate": {
            setUp: function () {
                var processedCategories = this.infographic.processCategories(categories),
                    processedVitamins = this.infographic.processVitamins(vitamins);
                this.processedFood = this.infographic.processFood(food, processedVitamins);
                this.values = this.infographic.populate(vitamins, this.processedFood, processedCategories, order);
            },
            "An array is returned": function () {
                assert.equals(this.values.length, Object.keys(vitamins).length);
            },
            "B1 has correct values": function () {
                var B1 = this.values[1],
                    processedCategories = this.infographic.processCategories(categories);
                delete B1.children;
                assert.equals(B1, {
                    "html": "B<sup>1</sup>",
                    "label": "B1",
                    "default": processedCategories.label["default"],
                    "focus": processedCategories.label.focus,
                    "focusCount": 0,
                    "foodCount": 1
                });
            },
            "A has one child": function () {
                var A = this.values[0];
                assert.defined(A.children);
                assert.equals(A.children.length, 1);
            },
            "Mediator is updated": function () {
                assert.equals(this.infographic.mediator.size(), 18);
            }
        },
        "Infographic.processCategories": {
            setUp: function () {
                this.processedCategories = this.infographic.processCategories(categories);
            },
            "Should return an object": function () {
                assert.isObject(this.processedCategories);
            },
            "Number of keys equal number of categories": function () {
                assert.equals(Object.keys(this.processedCategories).length, categories.length);
            },
            "Should output correct result": function () {
                assert.equals(this.processedCategories, {
                    "label": categories[0],
                    "meat": categories[1],
                    "vegetables": categories[2]
                });
            }
        },
        "Infographic.processFood": {
            setUp: function () {
                var processedVitamins = this.infographic.processVitamins(vitamins);
                this.processedFood = this.infographic.processFood(food, processedVitamins);
            },
            "An object is returned": function () {
                assert.isObject(this.processedFood);
            },
            "Same amount of food is returned": function () {
                assert.equals(Object.keys(this.processedFood).length, food.length);
            },
            "Vitamins are spread out correctly": function () {
                assert.equals(this.processedFood.carrot, _.extend({}, food[0], {
                    "vitamin": {
                        "A": true,
                        "B1": false
                    }
                }));
            }
        },
        "Infographic.processVitamins": {
            setUp: function () {
                this.processedVitamins = this.infographic.processVitamins(vitamins);
            },
            "Same amount of vitamins is returned": function () {
                assert.equals(Object.keys(this.processedVitamins).length, vitamins.length);
            },
            "Output is correct": function () {
                assert.equals(this.processedVitamins, {
                    "A": vitamins[0],
                    "B1": vitamins[1]
                });
            }
        },
        "Infographic.toggleFood": {
            setUp: function () {
                var processedVitamins = this.infographic.processVitamins(vitamins),
                    processedFood = this.infographic.processFood(food, processedVitamins);
                this.infographic.toggleFood(processedFood.carrot);
            },
            "All values concerning carrot are affected": function () {
                assert.equals(this.infographic.values[0].focusCount, 1);
                assert.equals(this.infographic.values[0].children[0].focusCount, 1);
                assert.equals(this.infographic.values[0].children[0].children[0].focusCount, 0);
                assert.equals(this.infographic.values[1].focusCount, 0);
                assert.equals(this.infographic.values[1].children[0].focusCount, 0);
                assert.equals(this.infographic.values[1].children[0].children[0].focusCount, 0);
            }
        }
    });

    buster.testCase("UserInput", {
        setUp: function () {
            this.UserInput = new global.UserInput(order, food);
        },
        "Returns an object": function () {
            assert.isObject(this.UserInput);
        },
        "Number of categories are limited to food categories": function () {
            assert.equals(this.UserInput.values.length, Object.keys(order).length);
        },
        "Number of food preserved": function () {
            var vegetables = this.UserInput.values[0];
            assert.equals(vegetables.food.length, 3);
        }
    });
}(document || window, _));