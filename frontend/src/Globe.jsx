import React, { Component, useState, useRef, useEffect } from "react";
import * as d3 from 'd3';
import * as topojson from "topojson";
import data50 from "./land-50m.json";
import dataCoarse from "./GeoChart.world.geo.json";
// import lightsFine from "./geonames-all-cities-with-a-population-1000.json";

var data = [1, 2];

var asdf =  [
    {type: "LineString", coordinates: [[-123.1207, 49.2827], [114.1694, 22.3193]]},
    {type: "LineString", coordinates: [[114.1694, 22.3193], [120.9842, 14.5995]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [144.9631, -37.8136]]},
    {type: "LineString", coordinates: [[-123.1207, 49.2827], [-73.7781, 40.6413]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [103.9915, 1.3644]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [125.6455, 7.1304]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [140.3929, 35.7720]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [-123.1207, 49.2827]]},
    {type: "LineString", coordinates: [[-123.1207, 49.2827], [-156.0407, 19.7367]]}
]

var cities = [
    ["1137347","Dubai","25.0657","55.17128","03","AE"]
];

var points = [{
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [55.17128, 25.0657]
    },
    "properties": {
      "name": "Dinagat Islands"
    }
  }]

// var cities =  [
//     {type: "LineString", coordinates: [[-123.1207, 49.2827], [114.1694, 22.3193]]},
//     {type: "LineString", coordinates: [[114.1694, 22.3193], [120.9842, 14.5995]]},
//     {type: "LineString", coordinates: [[120.9842, 14.5995], [144.9631, -37.8136]]},
//     {type: "LineString", coordinates: [[-123.1207, 49.2827], [-73.7781, 40.6413]]},
//     {type: "LineString", coordinates: [[120.9842, 14.5995], [103.9915, 1.3644]]},
//     {type: "LineString", coordinates: [[120.9842, 14.5995], [125.6455, 7.1304]]},
//     {type: "LineString", coordinates: [[120.9842, 14.5995], [140.3929, 35.7720]]},
//     {type: "LineString", coordinates: [[120.9842, 14.5995], [-123.1207, 49.2827]]},
//     {type: "LineString", coordinates: [[-123.1207, 49.2827], [-156.0407, 19.7367]]}
// ]

function Globe({size, scale}) {
    const svgRef = useRef();
    var circle = d3.geoCircle();
    const projection = d3.geoOrthographic()
        .fitSize([size, size], {type: "Sphere"})
        .precision(0.1);

    // projection.rotate(coordinates);

    const pathGenerator = d3.geoPath().projection(projection);

    const [mouseCoordinates, setMouseCoordinates] = useState(null);
    const [oldCoordinates, setOldCoordinates] = useState([90, -14.5995]);
    const [newCoordinates, setNewCoordinates] = useState(null);

    const onMouseDownHandler = (e) => {
        // console.log("mouse down", e);
        setMouseCoordinates([e.screenX, e.screenY]);
        // setOldCoordinates(projection.rotate());
    };

    const getCityRadius = (population) => {
        if (population < 5000)
            return 0.02
        else if (population < 10000)
            return 0.05
        else if (population < 50000)
            return 0.07
        else if (population < 100000)
            return 0.1
        else if (population < 200000)
            return 0.2
        else if (population < 500000)
            return 0.3
        else if (population < 1000000)
            return 0.4
        else if (population < 2000000)
            return 0.5
        else if (population < 4000000)
            return 0.6
        else
            return 0.7
    };

    const onMouseMoveHandler = (e) => {
        if(mouseCoordinates){
            // console.log("mouse move", e);
            var currentMouseCoordinates = [e.screenX, e.screenY];
            var scalingFactor = 6.0 * scale/200.0;
            var movedCoordinates = [oldCoordinates[0] + (currentMouseCoordinates[0] - mouseCoordinates[0])/scalingFactor, oldCoordinates[1] - (currentMouseCoordinates[1] - mouseCoordinates[1])/scalingFactor];
            movedCoordinates[1] = movedCoordinates[1] < -90 ? -90 :
                movedCoordinates[1] > 90 ?  90 : movedCoordinates[1];
            // projection.rotate(movedCoordinates);
            setNewCoordinates(movedCoordinates);
            drawGlobe(movedCoordinates, scale);
        }
    };

    const onMouseUpHandler = (e) => {
        // console.log("mouse up", e);
        setMouseCoordinates(null);
        setOldCoordinates(newCoordinates);
        setNewCoordinates(null);
    };

    // const onScrollHandler = (e) => {
    //     console.log("scroll", e);
    // }

    const drawSphere = (svg) => {
        svg
            .selectAll(".sphere")
            .data([{type: "Sphere"}])
            .join("path")
            .attr("class", "sphere")
            // .attr("stroke", "#bbf")
            .attr("fill", "#dde")//daytime
            // .attr("fill", "black")//nighttime
            .attr("d", feature => pathGenerator(feature));
    };

    const drawGraticule = (svg) => {
        const graticule = d3.geoGraticule10()
        svg
            .selectAll(".mesh")
            .data([graticule])
            .join("path")
            .attr("class", "mesh")
            .attr("fill-opacity","0")
            .attr("stroke", feature => "#ccf")//daytime
            // .attr("stroke", feature => "#444")//nighttime
            .attr("d", feature => pathGenerator(feature));
    };

    const drawLand = (svg) => {
        //Using local json data that is of type Topology
        // console.log("data50", data50);
        // console.log("populationData", populationData);

        const countries1 = topojson.feature(data50, data50.objects.land).features
        svg
        .selectAll(".country")
        .data(countries1)
        .join("path")
        .attr("class", "country")
        .attr("fill", feature => "#edd")//daytime
        // .attr("fill", feature => "#114")//nighttime
        .attr("stroke", feature => "#faa")//daytime
        // .attr("stroke", feature => "#004")//nighttime
        .attr("d", feature => pathGenerator(feature));

        //Using external json data that is of type Topology
        // d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(res => {
        //     console.log("res", res);
        //     const countries = topojson.feature(res, res.objects.countries).features
        //     console.log("countries", countries);
        //     svg
        //     .selectAll(".country")
        //     .data(countries)
        //     .join("path")
        //     .attr("class", "country")
        //     .attr("fill", feature => "#edd")
        //     .attr("stroke", feature => "#f99")
        //     .attr("d", feature => pathGenerator(feature));
        // });

        //Using local json data that is of type FeatureCollection
        // svg
        //     .selectAll(".country")
        //     .data(dataCoarse.features)
        //     .join("path")
        //     .attr("class", "country")
        //     // .attr("fill", feature => "#edd")//daytime
        //     .attr("fill", feature => "#114")//nighttime
        //     // .attr("stroke", feature => "#faa")//daytime
        //     .attr("stroke", feature => "#004")//nighttime
        //     .attr("d", feature => pathGenerator(feature));
    };

    const drawLights = (svg) => {
        // svg
        //     .selectAll(".lights")
        //     .data(cities)
        //     .join("path")
        //     .attr("class", "lights")
        //     // .attr("stroke", feature => "red")
        //     // .attr("stroke-width", 1)
        //     .style("fill", "white")
        //     .attr("d", cityElement => pathGenerator(circle.center([parseFloat(cityElement[3]), parseFloat(cityElement[2])]).radius(0.1)()));

        d3.json("https://s3-us-west-2.amazonaws.com/s.cdpn.io/215059/cities-200000.json").then(res => {
            svg
            .selectAll(".lights")
            .data(res)
            .join("path")
            .attr("class", "lights")
            .style("fill", "#ff8")
            .attr("fill-opacity","0.4")
            .attr("d", cityElement => pathGenerator(circle.center([parseFloat(cityElement[3]), parseFloat(cityElement[2])]).radius(getCityRadius(cityElement[0]))()));
        });

        // d3.json("https://data.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000%40public&rows=10000&sort=population&facet=timezone&facet=country").then(res => {
        //     console.log(res);
        //     svg
        //     .selectAll(".lights")
        //     .data(res.records)
        //     .join("path")
        //     .attr("class", "lights")
        //     .style("fill", "#ff8")
        //     .attr("fill-opacity","0.4")
        //     .attr("d", cityElement => pathGenerator(circle.center(cityElement.geometry.coordinates).radius(getCityRadius(cityElement.fields.population))()));
        // });

        // console.log(lightsFine);
        // svg
        //     .selectAll(".lights")
        //     .data(lightsFine)
        //     .join("path")
        //     .attr("class", "lights")
        //     .style("fill", "#ff8")
        //     .attr("fill-opacity","0.4")
        //     .attr("d", cityElement => pathGenerator(circle.center(cityElement.geometry.coordinates).radius(getCityRadius(cityElement.fields.population))()));
    };

    const drawArcs = (svg) => {
        svg
            .selectAll(".arc")
            .data(asdf)
            .join("path")
            .attr("class", "arc")
            // .transition()
            .attr("fill-opacity","0")
            .attr("stroke", feature => "black")//daytime
            // .attr("stroke", feature => "gray")//daytime
            .attr("stroke-width", 1)
            .attr("d", feature =>pathGenerator(feature));
    };
    
    const drawGlobe = (rotateParams, scaleParams) => {
        // console.log("data", data);
        // console.log("scale", scale);
        const svg = d3.select(svgRef.current);
        projection.rotate(rotateParams).scale(scaleParams);
        
        drawSphere(svg);
            
        drawGraticule(svg);

        drawLand(svg);

        // drawLights(svg);

        drawArcs(svg);
    };

    // useEffect(() => {
    //     console.log("asdfasdf")
    //     drawGlobe(oldCoordinates, scale);
    // }, [])
    
    useEffect(() => {
        // console.log("fffffff");
        drawGlobe(oldCoordinates, scale);
    }, [scale])

    
    
    return (
        <svg width={size} height={size} ref={svgRef} 
            onMouseDown={onMouseDownHandler} 
            onMouseMove={onMouseMoveHandler} 
            onMouseUp={onMouseUpHandler}>
        </svg>
    );
}
 
export default Globe;