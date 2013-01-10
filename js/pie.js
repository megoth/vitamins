Raphael.fn.pieChart = function (cx, cy, r, values, labels, backgroundColors, textColors, fontSize, stroke) {
    var paper = this,
        rad = Math.PI / 180,
        chart = this.set();
    function sector(cx, cy, r, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * rad),
            x2 = cx + r * Math.cos(-endAngle * rad),
            y1 = cy + r * Math.sin(-startAngle * rad),
            y2 = cy + r * Math.sin(-endAngle * rad);
        return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    }
    var angle = 90,
        total = 0,
        start = 0,
        process = function (j) {
            var value = values[j],
                angleplus = 360 * value / total,
                popangle = angle + (angleplus / 2),
                color = backgroundColors[j],
                delta = -20,
                bcolor = backgroundColors[j],
                p = sector(cx, cy, r, angle, angle + angleplus, {
                    fill: "90-" + bcolor + "-" + color,
                    stroke: stroke,
                    "stroke-width": 3
                }),
                txt = paper
                    .text(cx + (r + delta) * Math.cos(-popangle * rad), cy + (r + delta) * Math.sin(-popangle * rad), labels[j])
                    .attr({
                        fill: textColors[j],
                        stroke: "none",
                        opacity: 1,
                        "font-size": fontSize
                    })
                    .transform("r" + (angle * -1 + 75));
            angle += angleplus;
            chart.push(p);
            chart.push(txt);
            start += .1;
        };
    for (var i = 0, ii = values.length; i < ii; i++) {
        total += values[i];
    }
    for (i = 0; i < ii; i++) {
        process(i);
    }
    return chart;
};