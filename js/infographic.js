var Infographic = function (paper, table, size) {
    var values,
        labels,
        x = size,
        y = size,
        item,
        row,
        backgroundColors,
        textColors,
        fontSize,
        charts = [];
    table.find("tr").each(function () {
        row = $(this);
        backgroundColors = [];
        values = [];
        labels = [];
        textColors = [];
        fontSize = parseInt(row.css('font-size'));
        $("td", this).each(function () {
            item = $(this);
            backgroundColors.push(item.css('background-color'));
            textColors.push(item.css('color'));
            values.push(7.69);
            labels.push(item.text().replace("\n", ""));
        });
        charts.push(paper.pieChart(x, y, size, values, labels, backgroundColors, textColors, fontSize, "#000"));
        size -= row.height();
    });
    var circle = paper.circle(x, y, size);
    circle.attr("fill", "#fff");
};


$(function () {
    var size = 400,
        paper = Raphael("Infographic", size * 2, size * 2),
        table = $("#Values"),
        userInput = $("#UserInput"),
        className;
    userInput.find("input").on("change", function (e) {
        className = $(this).val();
        table.toggleClass(className);
        console.log(className);
        paper.clear;
        new Infographic(paper, table, size);
    });
    new Infographic(paper, table, size);
});