/*<<dependency*/
define("sap_viz_ext_helloworld-src/js/render", ["sap_viz_ext_helloworld-src/js/utils/util"], function(util){
/*dependency>>*/
    /*
     * This function is a drawing function; you should put all your drawing logic in it.
     * it's called in moduleFunc.prototype.render
     * @param {Object} data - proceessed dataset, check dataMapping.js
     * @param {Object} container - the target d3.selection element of plot area
     * @example
     *   container size:     this.width() or this.height()
     *   chart properties:   this.properties()
     *   dimensions info:    data.meta.dimensions()
     *   measures info:      data.meta.measures()
     */
    var render = function(data, container) {
        var width = this.width(),
            height = this.height(),
            colorPalette = this.colorPalette(),
            properties = this.properties(),
            dispatch = this.dispatch();
        //prepare canvas with width and height of container
        
        container.selectAll("svg").remove();
        var vis = container.append("svg").attr("width", width).attr("height", height)
                    .append("g").attr("class", "vis").attr("width", width).attr("height", height);
          //alert(properties);
          console.log(properties);
// START    : sample render code for a column chart
// Replace the code below with your own one to develop a new extension
      
        /**
         * To get the dimension set, you can use either name or index of the dimension set, for example
         *     var dset_xaxis = data.meta.dimensions("X Axis");    // by name 
         *     var dset1 = data.meta.dimensions(0);                // by index
         * 
         * To get the dimension or measure name, you should only use index of the dimension and avoid
         * hardcoded names.
         *     var dim1= dset_xaxis[0];        // the name of first dimension of dimension set "X Axis"
         * 
         * The same rule also applies to get measures by using data.meta.measures()
         */
        var dsets = data.meta.dimensions();
        
        var mset1 = data.meta.measures(0);
        // only one measure "Margin" is used in this sample
        var ms1 = mset1[0];                                                      

        // converts the json object array data into simple key-value array.
        var fdata = data.map(function(d) {
            var val = parseFloat(d[ms1]);
            var mems = [];
            $.each(dsets, function(idx, dim) {
                mems.push(d[dim]);
            });
            return [mems.join(" / "), val];
        });

        var margin = {
            top: 20,
            right: 20,
            bottom: 60,
            left: 50
        };
        var plotWidth = width - margin.left - margin.right,
            plotHeight = height - margin.top - margin.bottom;
        //transform plot area
        vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        //create x and y scales, domains and axes
        var x = d3.scale.ordinal().rangeRoundBands([0, plotWidth], .1);
        x.domain(fdata.map(function(d) {
            return d[0];
        }));
        var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(function(d) {
            //don't show x labels
            return "";
        });

        var y = d3.scale.linear().range([plotHeight, 0]);
        y.domain([0, d3.max(fdata, function(d) {
            return d[1];
        })]);
        var yAxis = d3.svg.axis().scale(y).orient("left");

        //draw x axis
        vis.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + plotHeight + ")")
            .call(xAxis)
            .append("text")
            .attr("x", plotWidth)
            .attr("dy", "1.5em")
            .style("text-anchor", "end")
            .text(dsets.join(" / "));

        //draw y axis
        vis.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(ms1);

        //draw bars
        vis.selectAll(".bar").data(fdata).enter().append("rect").attr("class", "bar").attr("x", function(d) {
            return x(d[0]);
        }).attr("width", x.rangeBand()).attr("y", function(d) {
            return y(d[1]);
        }).attr("height", function(d) {
            return plotHeight - y(d[1]);
        }).attr("fill", function(d, i) {
            return colorPalette[i % colorPalette.length];
        }).attr("stroke", properties ? properties.borderColor : "none").on("click", function(d, i) {
            // trigger a customized event which can be used in HTML file
            dispatch.barData(d);
            // trigger the data selection event which can be responded in SAP Lumira.
            util.fireSelectDataEvent(dispatch, ms1, d, i);
        });

        //set style of axis and its ticks and text
        $(".axis path, .axis line").css({
            fill: "none",
            stroke: "#000",
            "shape-rendering": "crispEdges"
        });
        $(".axis text").css({
            "font-size": "12px"
        });
        $(".axis > text").css({
            "font-size": "16px",
            "font-weight": "bold"
        });
// END: sample render code
    };

    return render; 
})