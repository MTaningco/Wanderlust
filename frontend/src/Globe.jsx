//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import * as d3 from 'd3';
import * as topojson from "topojson";
import { useIdleTimer } from 'react-idle-timer';

//Imports from self defined structures
//https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-10m.json
//https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json
//https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json
import landFine from "./jsonData/land-50m.json";//TODO: use 10 m if land vs water bug is fixed
import landCoarse from "./jsonData/land-110m.json";
//https://s3-us-west-2.amazonaws.com/s.cdpn.io/215059/cities-200000.json
//https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=&rows=10000&sort=population&pretty_print=true&format=json&fields=population,coordinates,name
import lightsFine from "./jsonData/geonames-all-cities-with-a-population-1000.json";
import lightsCoarse from "./jsonData/cities-200000.json";//TODO: use if performance is fixed

function Globe({size, scale, paths, landmarks, landmarkHandler, tempPath, tempLandmark}) {
    //States
    const [mouseCoordinates, setMouseCoordinates] = useState(null);         //state for initially pressing down the mouse button's position
    const [oldCoordinates, setOldCoordinates] = useState([180, -25]);   //state for the position of the globe during inactivity (units in -longitude, -latitude)
    const [newCoordinates, setNewCoordinates] = useState(null);             //state for updating the old coordinates

    //Constants
    const svgRef = useRef();
    const circle = d3.geoCircle();
    const projection = d3.geoOrthographic()
        .fitSize([size, size], {type: "Sphere"})
        .precision(0.1);
    const pathGenerator = d3.geoPath().projection(projection);

    /**
    * Handles the mouse down event in the Globe.
    * @param {*} event - the mouse event
    */
    const onMouseDownHandler = (event) => {
        setMouseCoordinates([event.screenX, event.screenY]);
    };

    /**
     * Gets the Radius of the city.
     * @param {int} population - the population of the city
     */
    const getCityRadius = (population) => {
        if (population < 5000)
            return 0.02
        else if (population < 10000)
            return 0.05
        else if (population < 50000)
            return 0.07
        else if (population < 100000)
            return 0.1
        else
            return 0.2
    };

    /**
     * Handles when the user has become idle.
     * @param {*} event - the event during idle.
     */
    const handleOnIdle = event => {
        drawGlobe(oldCoordinates, scale, false);
    }
    
    /**
     * Handles when the user has become active.
     * @param {*} event - the event during active
     */
    const handleOnActive = event => {}
    
    /**
     * Handles when the user has done an action.
     * @param {*} event - the event during an action
     */
    const handleOnAction = (event) => {}
     
    //Idle timer and parameters
    const { getRemainingTime, getLastActiveTime, resume } = useIdleTimer({
        timeout: 1000 * 2,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        onAction: handleOnAction,
        events: ['mousedown'],
        debounce: 500
    })

    /**
     * Handler for when the mouse has been moved.
     * @param {*} event - the event of when the mouse has been moved
     */
    const onMouseMoveHandler = (event) => {
        if(mouseCoordinates){
            // console.log("mouse move", e);
            var currentMouseCoordinates = [event.screenX, event.screenY];
            var scalingFactor = 3.0 * scale/200.0;
            var movedCoordinates = [oldCoordinates[0] + (currentMouseCoordinates[0] - mouseCoordinates[0])/scalingFactor, oldCoordinates[1] - (currentMouseCoordinates[1] - mouseCoordinates[1])/scalingFactor];
            movedCoordinates[1] = movedCoordinates[1] < -90 ? -90 :
                movedCoordinates[1] > 90 ?  90 : movedCoordinates[1];
            // projection.rotate(movedCoordinates);
            setNewCoordinates(movedCoordinates);
            drawGlobe(movedCoordinates, scale, true);
        }
    };

    /**
     * Handler when the mouse click is now up.
     * @param {*} event - the event of when the mouse click is now up
     */
    const onMouseUpHandler = (event) => {
        if(newCoordinates){
            setMouseCoordinates(null);
            setOldCoordinates(newCoordinates);
            setNewCoordinates(null);
        }
        setMouseCoordinates(null);
    };

    /**
     * Draws a sphere.
     * @param {*} svg - the svg used to draw the sphere.
     * @param {boolean} isDaylight - the parameter for night time styles
     */
    const drawSphere = (svg, isDaylight) => {
        svg
            .selectAll(".sphere")
            .data([{type: "Sphere"}])
            .join("path")
            .attr("class", "sphere")
            .attr("fill", isDaylight ? "#dde" : "#1c458c")
            .attr("d", feature => pathGenerator(feature));
    };

    /**
     * Draws the grid in the ocean.
     * @param {*} svg - the svg used to draw the sphere.
     * @param {boolean} isDaylight - the parameter for night time styles.
     */
    const drawGraticule = (svg, isDaylight) => {
        const graticule = d3.geoGraticule10()
        svg
            .selectAll(".mesh")
            .data([graticule])
            .join("path")
            .attr("class", "mesh")
            .attr("fill-opacity","0")
            .attr("stroke", isDaylight ? "#ccf" : "gray")
            .attr("stroke-opacity", "0.5")
            .attr("stroke-width", isDaylight ? 1 : 0.3)
            .attr("d", feature => pathGenerator(feature));
    };

    /**
     * Draws the land.
     * @param {*} svg - the svg used to draw the sphere
     * @param {boolean} isCoarse - the parameter for fine detail or coarse detail
     * @param {boolean} isDaylight - the parameter for night time styles
     */
    const drawLand = (svg, isCoarse, isDaylight) => {
        //Using local json data that is of type Topology
        const land = topojson.feature(isCoarse ? landCoarse : landFine, isCoarse ? landCoarse.objects.land : landFine.objects.land).features;
        // console.log(land);
        svg
        .selectAll(".country")
        .data(land)
        .join("path")
        .attr("class", "country")
        .attr("fill", isDaylight ? "#edd" : "#ba9868")
        .attr("stroke", isDaylight ? "#faa" : "#997d56")
        .attr("stroke-width", 0.5)
        .attr("d", feature => pathGenerator(feature));

        //Using external json data that is of type Topology
        // d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-10m.json").then(res => {
        //     const countries1 = topojson.feature(isCoarse ? landCoarse : res, isCoarse ? landCoarse.objects.land : res.objects.land).features;
        //     console.log(countries1);
        //     svg
        //     .selectAll(".country")
        //     .data(countries1)
        //     .join("path")
        //     .attr("id", feature => console.log(feature))
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

    /**
     * Draws city lights based on population sizes in cities.
     * @param {*} svg - the svg used to draw city lights
     */
    const drawLights = (svg, isCoarse) => {
        if(isCoarse){
            svg
            .selectAll(".lights")
            .data(lightsCoarse)
            .join("path")
            .attr("class", "lights")
            .style("fill", "#ff8")
            .attr("fill-opacity","0.4")
            .attr("d", cityElement => pathGenerator(circle.center([parseFloat(cityElement[3]), parseFloat(cityElement[2])]).radius(getCityRadius(cityElement[0]))()));
        }else{
            svg
            .selectAll(".lights")
            .data(lightsFine)
            .join("path")
            .attr("class", "lights")
            .style("fill", "#ff8")
            .attr("fill-opacity","0.4")
            .attr("d", cityElement => pathGenerator(circle.center(cityElement.geometry.coordinates).radius(getCityRadius(cityElement.fields.population))()));
        }
    };

    /**
     * Draws the landmarks.
     * @param {*} svg - the svg used to draw the landmarks
     * @param {boolean} isDaylight - the parameter used for night time styles
     */
    const drawLandmarks = (svg, isDaylight) => {
        // Format of one element of data
        //   {
        //     id: "landmark_1",
        //     landmark_uid: 1,
        //     name: "Manila / Marikina",
        //     description: "First Hometown. Revisited 2011, 2013, 2017, 2018, and 2019.",
        //     coordinates: [120.9842, 14.5995]
        //   }
        // console.log("drawing landmarks");
        svg
            .selectAll(".landmarks")
            .data(landmarks)
            .join("path")
            .attr("class", "landmarks")
            .attr("id", landmark => `${landmark.id}`)
            .style("fill", isDaylight ? "black" : "black")
            .attr("fill-opacity","0.3")
            .on("mouseover", (mouseEvent, item) => {
                d3.select(`#${item.id}`).style("fill", "red")
                .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.7)()));
                landmarkHandler(item);
            } )
            .on("mouseout", (mouseEvent, item) => {
                d3.select(`#${item.id}`)
                .style("fill", isDaylight ? "black" : "black")
                .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)()));
                landmarkHandler(null);
            } )
            .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)())).raise();
    };

    const drawTempLandmark = (svg, isDaylight) => {
        //format of one element of data
        // {
        //     name: "",
        //     description: "",
        //     coordinates: [0, 0],
        //     isVisible: false
        //   }
        svg
            .selectAll(".tempLandmark")
            .data(tempLandmark)
            .join("path")
            .attr("class", "tempLandmark")
            .attr("id", landmark => `temp_${landmark.id}`)
            .style("fill", "blue")
            .attr("fill-opacity","0.5")
            .attr("visibility", landmark => landmark.isVisible ? "visible" : "hidden")
            .on("mouseover", (mouseEvent, item) => {
                d3.select(`#temp_${item.id}`).style("fill", "red")
                .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.7)()));
                landmarkHandler(item);
            } )
            .on("mouseout", (mouseEvent, item) => {
                d3.select(`#temp_${item.id}`)
                .style("fill", "red")
                .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)()));
                landmarkHandler(null);
            } )
            .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)()));
    };

    /**
     * Draws the arcs.
     * @param {*} svg - the svg used to draw the arcs
     * @param {boolean} isDayTime - the parameter used for night time styles
     */
    const drawArcs = (svg, isDayTime) => {
        //The format of one element of data is 
        //{ type: "LineString", coordinates: [[-122.810850, 49.191663], [-156.0407, 19.7367]], id:"path_9", path_uid: 9, isAirPlane: true}
        svg
            .selectAll(".arc")
            .data(paths)
            .join("path")
            .attr("class", "arc")
            // .transition()
            .attr("fill-opacity", "0")
            .attr("stroke-opacity", feature => feature.isAirPlane ? 0.3 : 1)
            .attr("stroke", feature => isDayTime ? "black" : "#5c5c5c")
            .attr("stroke-width", feature => feature.isAirPlane ? 2 : 0.5)
            .attr("d", feature =>pathGenerator(feature));
    };

    const drawTempPath = (svg, isDayTime) => {
        //format of one element of data
        // {
        //     type: "LineString", 
        //     coordinates: [],
        //     isAirPlane: true
        //   }
        svg
            .selectAll(".tempPath")
            .data(tempPath)
            .join("path")
            .attr("class", "tempPath")
            // .transition()
            .attr("fill-opacity","0")
            .attr("stroke", feature => isDayTime ? "red" : "blue")
            .attr("stroke-opacity", feature => feature.isAirPlane ? 0.1 : 1)
            .attr("stroke-width", feature => feature.isAirPlane ? 2 : 0.5)
            .attr("d", feature =>pathGenerator(feature));
    };
    
    /**
     * Draws the globe.
     * @param {Array<number>} rotateParams - the rotation parameters to position the globe
     * @param {number} scaleParams - the scale parameter to scale the globe
     * @param {boolean} isCoarse - the parameter for fine detail or coarse detail
     */
    const drawGlobe = (rotateParams, scaleParams, isCoarse) => {
        const svg = d3.select(svgRef.current);
        projection.rotate(rotateParams).scale(scaleParams);

        var isDaylight = false;
        
        drawSphere(svg, isDaylight);

        drawLand(svg, isCoarse, isDaylight);
            
        drawGraticule(svg, isDaylight);

        if(!isDaylight){
            // drawLights(svg, false);
        }

        drawArcs(svg, isDaylight);

        drawTempPath(svg, isDaylight);
        
        drawTempLandmark(svg, isDaylight);

        drawLandmarks(svg, isDaylight);

    };

    //Use effect hook.
    useEffect(() => {
        drawGlobe(oldCoordinates, scale, true);
    }, [scale, landmarks, paths, tempPath, tempLandmark])
    
    return (
        <svg width={size} height={size} ref={svgRef} style={{border:1 }}
            onMouseDown={onMouseDownHandler} 
            onMouseMove={onMouseMoveHandler} 
            onMouseUp={onMouseUpHandler}>
        </svg>
    );
}
 
export default Globe;