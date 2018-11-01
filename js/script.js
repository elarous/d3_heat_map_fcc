document.addEventListener("DOMContentLoaded",() => {
    let req = new XMLHttpRequest();
    req.open("GET","https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",true);
    req.setRequestHeader("Content-Type","text/plain");
    req.onreadystatechange = () => {
        if (req.readyState == 4 && req.status == 200){
            const json = JSON.parse(req.responseText);
            makeChart(json);
        }
    };
    req.send();
});

function makeChart(dataset){
    const h = 600;
    const w = 1400;
    const padding = 100;
    const legendWidth = 100;
    const baseTemperature = dataset.baseTemperature;
    const data = dataset.monthlyVariance;
    const cellHeight = (h - (padding * 2)) / 12;
    const cellWidth = 5;
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const minYear = d3.min(data, (d) => d.year) - 1;
    const maxYear = d3.max(data, (d) => d.year) + 1;
    const minMonth = d3.min(data, (d) => d.month);
    const maxMonth = d3.max(data, (d) => d.month) + 1;
    const minTemp = d3.min(data, (d) => baseTemperature + d.variance);
    const maxTemp = d3.max(data, (d) => baseTemperature + d.variance);
    const legendData = d3.range(0,maxTemp,(maxTemp - minTemp) / 10);

    const xScale = d3.scaleLinear()
          .domain([minYear,maxYear])
          .range([padding, w - padding]);

    const yScale = d3.scaleBand()
          .domain(d3.range(0,12))
          .range([padding,h - padding]);

    const colorScale = d3.scaleLinear()
          .domain([minTemp,maxTemp])
          .range([0,1]);

    const xAxisScale = d3.scaleLinear()
          .domain([minYear,maxYear])
          .range([padding, w - padding]);

    const legendScale = d3.scaleOrdinal()
          .domain(legendData)
          .range(legendData.map((d,i) => i * 30 + padding));

    const xAxis = d3.axisBottom(xAxisScale)
          .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale)
          .tickValues(yScale.domain())
          .tickFormat((m) => months[m]);

    let tooltip = d3.select("#container")
        .append("div")
        .attr("id","tooltip");

    let svg = d3.select("#container")
        .append("svg")
        .attr("height",h)
        .attr("width",w);

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class","cell")
        .attr("data-month",(d) => d.month - 1)
        .attr("data-year",(d) => d.year)
        .attr("data-temp",(d) => baseTemperature + d.variance)
        .attr("height",cellHeight)
        .attr("width",cellWidth)
        .attr("x",(d) => xScale(d.year))
        .attr("y",(d) => yScale(d.month - 1))
        .attr("fill",(d) => d3.interpolatePuOr(colorScale(baseTemperature + d.variance)))
        .on("mouseover", (d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity",1)
                .style("left",xScale(d.year) + 10 +"px")
                .style("top", yScale(d.month) + 10+"px");
            tooltip.attr("data-year",d.year)
                .html("<h1>"+d.year+"</h1>"
                      +"<h2>"+months[d.month - 1]+"</h2>"
                      +"<div>"+d3.format(".1f")(baseTemperature + d.variance)+"&deg;C</div>"
                      +"<div>"+d3.format(".1f")(d.variance)+"&deg;C</div>");
        })
        .on("mouseout", (d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity","0");
        });;


    svg.append("g")
        .attr("id","x-axis")
        .attr("transform","translate(0,"+(h - padding)+")")
        .call(xAxis);

    svg.append("g")
        .attr("id","y-axis")
        .attr("transform","translate("+padding+",0)")
        .call(yAxis);

    svg.append("g")
        .attr("id","legend")
        .selectAll("rect")
        .data(legendData.slice(0,legendData.length - 1))
        .enter()
        .append("rect")
        .attr("height",30)
        .attr("width",30)
        .attr("x",(d,i) => padding + i * 30)
        .attr("y",(h - padding / 2))
        .attr("fill", (d) => d3.interpolatePuOr(colorScale(d)))
    ;

    const legendAxis = d3.axisBottom(legendScale)
          .tickFormat(d3.format(".1f"));

    svg.append("g")
        .attr("id","legend-axis")
        .attr("transform","translate(0,"+(h - (padding / 2) + 30)+")")
        .call(legendAxis);

    }
