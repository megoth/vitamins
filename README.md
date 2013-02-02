# Vitamins

A small experiment trying to port the visualization used in [More than supplemental](http://sblattindesign.wordpress.com/2012/01/04/supplemental/) to an interactive, web-based visualization.

The data is located in `lib/data.json`, which should reflect the original data given in More than supplemental.

The project uses [D3.js](http://d3js.org/) to visualize the data, [jQuery](http://jquery.com/) to handle some DOM, and [Underscore](http://underscorejs.org/) for some utility functions. [Sass](http://sass-lang.com/) and [Compass](http://compass-style.org/) is used for easier stylesheet-handling. Most public functions are tested (using [Buster.js](http://busterjs.org), except the ones handled by D3.js.

The code is written by [Arne Hassel](http://icanhasweb.net).