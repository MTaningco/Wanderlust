import React, { Component, useState, useRef, useEffect } from "react";
import * as d3 from 'd3';
import * as topojson from "topojson";
import data50 from "./land-50m.json";
import land110 from "./land-110m.json";
import dataCoarse from "./GeoChart.world.geo.json";
// import lightsFine from "./geonames-all-cities-with-a-population-1000.json";
import { useIdleTimer } from 'react-idle-timer';

var data = [1, 2];

// var paths =  [
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

// var landmarks = [
//     {
//         id: "manila_ph",
//         name: "Manila / Marikina",
//         description: "First Hometown. Revisited 2011, 2013, 2017, 2018, and 2019.",
//         coordinates: [120.9842, 14.5995]
//     }
// ];

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

function Globe({size, scale, paths, landmarks, landmarkHandler}) {
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
    // const [isCoarse, setIsCoarse] = useState(true);

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

    const handleOnIdle = event => {
        console.log('user is idle', event)
        console.log('last active', getLastActiveTime())
        // setIsCoarse(false);
        drawGlobe(oldCoordinates, scale, false);
    }
    
    const handleOnActive = event => {
        // if(event.type === "mousedown"){
        //     console.log('user clicked down on the mouse by handleOnActive', event)
        // }
    }
    
    const handleOnAction = (e) => {
        // if(e.type === "mousedown"){
        //     console.log('user clicked down on the mouse by handleOnAction', e)
        //     setIsCoarse(true);
        // }
    }
     
      const { getRemainingTime, getLastActiveTime } = useIdleTimer({
        timeout: 1000 * 5,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        onAction: handleOnAction,
        debounce: 500
      })

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
            drawGlobe(movedCoordinates, scale, true);
        }
    };

    const onMouseUpHandler = (e) => {
        // console.log("mouse up", e);
        if(newCoordinates){
            setMouseCoordinates(null);
            setOldCoordinates(newCoordinates);
            setNewCoordinates(null);
        }
        setMouseCoordinates(null);
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

    const drawLand = (svg, isCoarse) => {
        //Using local json data that is of type Topology
        // console.log("data50", data50);
        // console.log("populationData", populationData);
        // console.log("isCoarse?", isCoarse);
        const countries1 = topojson.feature(isCoarse ? land110 : data50, isCoarse ? land110.objects.land : data50.objects.land).features;
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
        //     .attr("fill", feature => "#edd")//daytime
        //     // .attr("fill", feature => "#114")//nighttime
        //     .attr("stroke", feature => "#faa")//daytime
        //     // .attr("stroke", feature => "#004")//nighttime
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

    const drawLandmarks = (svg) => {
        svg
            .selectAll(".landmarks")
            .data(landmarks)
            .join("path")
            .attr("class", "landmarks")
            .attr("id", landmark => `${landmark.id}`)
            // .attr("stroke", feature => "red")
            // .attr("stroke-width", 1)
            .style("fill", "black")
            .attr("fill-opacity","0.5")
            // .on("mouseover", landmark =>  d3.select(`#manila_ph`).style("fill", "red"))
            .on("mouseover", (mouseEvent, item) => {
                d3.select(`#${item.id}`).style("fill", "red")
                .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.7)()));
                landmarkHandler(item);
                // d3.select(`#label_${item.id}`)
                // .style("display",function(d) {
                //     return 'inline';
                // })
                // .attr("transform", function(landmark) {
                //     // console.log(landmark);
                //     var loc = projection([landmark.coordinates[0], landmark.coordinates[1]]),
                //     x = loc[0],
                //     y = loc[1];
                //     // var offset = x < width/2 ? -5 : 5;
                //     return "translate(" + (x) + "," + (y-15) + ")"
                // })
            } )
            .on("mouseout", (mouseEvent, item) => {
                d3.select(`#${item.id}`).style("fill", "black")
                .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.15)()));
                landmarkHandler(null);
            } )
            .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.15)()));

            // svg.append("g")
            // .attr("class","labels")
            // .selectAll("text")
            // .data(landmarks)
            // .enter()
            // .append("text")
            // .attr("class", "label")
            // .text(function(d) { return d.name })
            // svg.selectAll(".label")
            // .attr("transform", function(landmark) {
            // // console.log(landmark);
            // var loc = projection([landmark.coordinates[0], landmark.coordinates[1]]),
            //     x = loc[0],
            //     y = loc[1];
            //     // var offset = x < width/2 ? -5 : 5;
            //     return "translate(" + (x) + "," + (y-15) + ")"
            // })
            // .style("display",function(d) {
            //     // console.log("d", d);
            //     var loc = projection([landmark.coordinates[0], landmark.coordinates[1]]),
            //     x = loc[0],
            //     y = loc[1];
            //     return 'none';
            // })
    };

    const drawArcs = (svg) => {
        svg
            .selectAll(".arc")
            .data(paths)
            .join("path")
            .attr("class", "arc")
            // .transition()
            .attr("fill-opacity","0")
            .attr("stroke", feature => "black")//daytime
            // .attr("stroke", feature => "gray")//daytime
            .attr("stroke-width", 1)
            .attr("d", feature =>pathGenerator(feature));
    };
    
    const drawGlobe = (rotateParams, scaleParams, isCoarse) => {
        // console.log("data", data);
        // console.log("scale", scale);
        const svg = d3.select(svgRef.current);
        projection.rotate(rotateParams).scale(scaleParams);
        
        drawSphere(svg);
            
        drawGraticule(svg);

        drawLand(svg, isCoarse);

        // drawLights(svg);

        drawArcs(svg);
        drawLandmarks(svg);
        // console.log(document.getElementById('globeGrid').offsetWidth);
    };

    
    useEffect(() => {
        console.log("scale use effect")
        drawGlobe(oldCoordinates, scale, true);
    }, [scale])

    // useEffect(() => {
    //     console.log("general use effect")
    //     drawGlobe(oldCoordinates, scale);
        
    //     const svg = d3.select(svgRef.current);
    //     svg.append("g")
    //         .attr("class","labels")
    //         .selectAll("text")
    //         .data(landmarks)
    //         .enter()
    //         .append("text")
    //         .attr("class", "label")
    //         .attr("id", `label_${landmarks.id}`)
    //         .text(function(d) { return d.name })
    // }, [])
    
    
    return (
        <svg width={size} height={size} ref={svgRef} 
            onMouseDown={onMouseDownHandler} 
            onMouseMove={onMouseMoveHandler} 
            onMouseUp={onMouseUpHandler}>
        </svg>
    );
}
 
export default Globe;