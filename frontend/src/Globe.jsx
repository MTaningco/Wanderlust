//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import * as d3 from 'd3';
import * as topojson from "topojson";
import { useIdleTimer } from 'react-idle-timer';

//Imports from self defined structures
//https://github.com/martynafford/natural-earth-geojson
import landFine from "./jsonData/ne_10m_land.json";
import landCoarse from "./jsonData/ne_110m_land.json";
import lakesFine from "./jsonData/ne_10m_lakes.json";
import lakesCoarse from "./jsonData/ne_110m_lakes.json";
//https://s3-us-west-2.amazonaws.com/s.cdpn.io/215059/cities-200000.json
//https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=&rows=10000&sort=population&pretty_print=true&format=json&fields=population,coordinates,name
import lightsFine from "./jsonData/geonames-all-cities-with-a-population-1000.json";
import lightsCoarse from "./jsonData/cities-200000.json";//TODO: use if performance is fixed

function Globe({size, scale, paths, landmarks, landmarkHandler, tempPath, tempLandmark, currentLandmark, editLandmark}) {
    //States
    const [mouseCoordinates, setMouseCoordinates] = useState(null);         //state for initially pressing down the mouse button's position
    const [oldCoordinates, setOldCoordinates] = useState([180, -25]);   //state for the position of the globe during inactivity (units in -longitude, -latitude)
    const [newCoordinates, setNewCoordinates] = useState(null);             //state for updating the old coordinates
    const [isMove, setIsMove] = useState(false);
    const [isDrag, setIsDrag] = useState(false);

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
        // if(event !== null && event.type !== "mousedown"){
            // console.log("event for idle", event);
            // console.log("redrawing globe");
            // console.log("isMove=", isMove);
            // console.log("ismove", isMove);
            // console.log("!isDrag", !isDrag);
        if(isMove && !isDrag){
            // console.log("redrawing globe");
            drawGlobe(oldCoordinates, scale, false);
            setIsMove(false);
        }
        // }
        // console.log(event);
    }
    
    /**
     * Handles when the user has become active.
     * @param {*} event - the event during active
     */
    const handleOnActive = event => {
        // console.log(event.path[1].tagName === "svg");
        // if(event.path[1].tagName === "svg"){
        //     if(newCoordinates){
        //         setMouseCoordinates(null);
        //         setOldCoordinates(newCoordinates);
        //         setNewCoordinates(null);
        //     }
        //     setMouseCoordinates(null);
        // }
    }
    
    /**
     * Handles when the user has done an action.
     * @param {*} event - the event during an action
     */
    const handleOnAction = (event) => {}
     
    //Idle timer and parameters
    const { getRemainingTime, getLastActiveTime, resume } = useIdleTimer({
        timeout: 1000 * 1.5,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        onAction: handleOnAction,
        events: ['mouseup'],
        debounce: 500
    })

    /**
     * Handler for when the mouse has been moved.
     * @param {*} event - the event of when the mouse has been moved
     */
    const onMouseMoveHandler = (event) => {
        if(mouseCoordinates){
            // console.log("mouse move", e);
            // console.log("drawing the globe coarse");
            var currentMouseCoordinates = [event.screenX, event.screenY];
            var scalingFactor = 3.0 * scale/200.0;
            var movedCoordinates = [oldCoordinates[0] + (currentMouseCoordinates[0] - mouseCoordinates[0])/scalingFactor, oldCoordinates[1] - (currentMouseCoordinates[1] - mouseCoordinates[1])/scalingFactor];
            movedCoordinates[1] = movedCoordinates[1] < -90 ? -90 :
                movedCoordinates[1] > 90 ?  90 : movedCoordinates[1];
            // projection.rotate(movedCoordinates);
            setNewCoordinates(movedCoordinates);
            setIsMove(true);
            setIsDrag(true);
            drawGlobe(movedCoordinates, scale, true);
        }
    };

    /**
     * Handler when the mouse click is now up.
     * @param {*} event - the event of when the mouse click is now up
     */
    const onMouseUpHandler = (event) => {
        // console.log("mouseuphandler activated");
        if(newCoordinates){
            // setMouseCoordinates(null);
            setOldCoordinates(newCoordinates);
            setNewCoordinates(null);
        }
        setIsDrag(false);
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
            .attr("d", feature => pathGenerator(feature))
            .on("click", (mouseEvent, item) => {
                landmarkHandler([{
                    landmark_uid: -1,
                    name: "",
                    description: "",
                    coordinates: [0, 0],
                    isVisible: false
                }]);
            } );
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
            .attr("d", feature => pathGenerator(feature)).raise()
            .on("click", (mouseEvent, item) => {
                landmarkHandler([{
                    landmark_uid: -1,
                    name: "",
                    description: "",
                    coordinates: [0, 0],
                    isVisible: false
                }]);
            } );
    };

    /**
     * Draws the land.
     * @param {*} svg - the svg used to draw the sphere
     * @param {boolean} isCoarse - the parameter for fine detail or coarse detail
     * @param {boolean} isDaylight - the parameter for night time styles
     */
    const drawLand = (svg, isCoarse, isDaylight) => {
        //Using local json data that is of type Topology
        // console.log(landCoarse.objects.land);
        // console.log(landFine);
        const land = isCoarse ? landCoarse.features : landFine.features;
        // console.log(land);
        svg
        .selectAll(".country")
        .data(land)
        .join("path")
        .attr("class", "country")
        .attr("fill", isDaylight ? "#edd" : "#f5c684")
        .attr("stroke", isDaylight ? "#faa" : "#b89463")
        .attr("stroke-width", 0.5)
        .attr("d", feature => pathGenerator(feature))
        .on("click", (mouseEvent, item) => {
            landmarkHandler([{
                landmark_uid: -1,
                name: "",
                description: "",
                coordinates: [0, 0],
                isVisible: false
            }]);
        } )
        .raise();

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

    const drawLakes = (svg, isCoarse, isDaylight) => {
        const lakes = isCoarse ? lakesCoarse.features :lakesFine.features;
        svg
        .selectAll(".lakes")
        .data(lakes)
        .join("path")
        .attr("class", "lakes")
        .attr("fill", isDaylight ? "#edd" : "#1c458c")
        .attr("stroke", isDaylight ? "#faa" : "#b89463")
        .attr("stroke-width", 0.5)
        .attr("d", feature => pathGenerator(feature))
        .raise()
        .on("click", (mouseEvent, item) => {
            landmarkHandler([{
                landmark_uid: -1,
                name: "",
                description: "",
                coordinates: [0, 0],
                isVisible: false
            }]);
        });
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
            .style("fill", "black")
            .attr("fill-opacity","0.3")
            .on("mouseover", (mouseEvent, item) => {
                d3.select(`#${item.id}`).style("fill", "red")
                .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.3)()));
            } )
            .on("mouseout", (mouseEvent, item) => {
                d3.select(`#${item.id}`)
                .style("fill", isDaylight ? "black" : "black")
                .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)()));
            } )
            .on("click", (mouseEvent, item) => {
                landmarkHandler([{
                    landmark_uid: item.landmark_uid,
                    name: item.name,
                    description: item.description,
                    coordinates: item.coordinates,
                    isVisible: true
                }]);
            })
            .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)())).raise();
    };

    const drawCurrentLandmark = (svg, isDaylight) => {
        // console.log("this is the current landmark", currentLandmark);
        // var data = currentLandmark ? [currentLandmark] : [];
        svg
            .selectAll(".currentLandmark")
            .data(currentLandmark)
            .join("path")
            .attr("class", "currentLandmark")
            .attr("id", landmark => `current_${landmark.landmark_uid}`)
            .style("fill", "red")
            .attr("fill-opacity","0.3")
            .attr("visibility", landmark => landmark.isVisible ? "visible" : "hidden")
            .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.2)())).raise();
    }

    const drawCurrentShadow = (svg, isDaylight) => {
        var nightLongitude = 54 + 180;
        var nightLatitude = 19;
        var opacity = "0.06";
        svg
            .selectAll(".shadow")
            .data([1])
            .join("path")
            .attr("class", "shadow")
            .attr("id", `shadow`)
            .style("fill", "black")
            .attr("fill-opacity",opacity)
            .attr("d", pathGenerator(circle.center([nightLongitude, nightLatitude]).radius(90)())).raise()
            .on("click", (mouseEvent, item) => {
                landmarkHandler([{
                    landmark_uid: -1,
                    name: "",
                    description: "",
                    coordinates: [0, 0],
                    isVisible: false
                }]);
            });

            svg
            .selectAll(".shadow1")
            .data([1])
            .join("path")
            .attr("class", "shadow1")
            .attr("id", `shadow`)
            .style("fill", "black")
            .attr("fill-opacity",opacity)
            .attr("d", pathGenerator(circle.center([nightLongitude, nightLatitude]).radius(90-6)())).raise()
            .on("click", (mouseEvent, item) => {
                landmarkHandler([{
                    landmark_uid: -1,
                    name: "",
                    description: "",
                    coordinates: [0, 0],
                    isVisible: false
                }]);
            });

            svg
            .selectAll(".shadow2")
            .data([1])
            .join("path")
            .attr("class", "shadow2")
            .attr("id", `shadow`)
            .style("fill", "black")
            .attr("fill-opacity",opacity)
            .attr("d", pathGenerator(circle.center([nightLongitude, nightLatitude]).radius(90-12)())).raise()
            .on("click", (mouseEvent, item) => {
                landmarkHandler([{
                    landmark_uid: -1,
                    name: "",
                    description: "",
                    coordinates: [0, 0],
                    isVisible: false
                }]);
            });

            svg
            .selectAll(".shadow3")
            .data([1])
            .join("path")
            .attr("class", "shadow3")
            .attr("id", `shadow`)
            .style("fill", "black")
            .attr("fill-opacity",opacity)
            .attr("d", pathGenerator(circle.center([nightLongitude, nightLatitude]).radius(90-18)())).raise()
            .on("click", (mouseEvent, item) => {
                landmarkHandler([{
                    landmark_uid: -1,
                    name: "",
                    description: "",
                    coordinates: [0, 0],
                    isVisible: false
                }]);
            });
    }

    const drawTempLandmark = (svg, isDaylight) => {
        //format of one element of data
        // {
        //     coordinates: [0, 0],
        //     isVisible: false
        //   }
        svg
            .selectAll(".tempLandmark")
            .data(tempLandmark)
            .join("path")
            .attr("class", "tempLandmark")
            .attr("id", `tempLandmark`)
            .style("fill", "red")
            .attr("fill-opacity","0.5")
            .attr("visibility", landmark => landmark.isVisible ? "visible" : "hidden")
            .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)())).raise();
    };

    const drawEditLandmark = (svg, isDaylight) => {
        //format of one element of data
        // {
        //     coordinates: [0, 0],
        //     isVisible: false
        //   }
        // console.log(editLandmark);
        svg
            .selectAll(".editLandmark")
            .data(editLandmark)
            .join("path")
            .attr("class", "editLandmark")
            .attr("id", landmark => `edit`)
            .style("fill", "orange")
            .attr("fill-opacity","0.5")
            .attr("stroke-width", 1)
            .attr("stroke","black")
            .attr("visibility", landmark => landmark.isVisible ? "visible" : "hidden")
            .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)())).raise();
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
            .attr("stroke", feature => isDayTime ? "black" : "black")
            .attr("stroke-width", feature => feature.isAirPlane ? 2 : 0.5)
            .attr("d", feature =>pathGenerator(feature)).raise()
            .on("click", (mouseEvent, item) => {
                landmarkHandler([{
                    landmark_uid: -1,
                    name: "",
                    description: "",
                    coordinates: [0, 0],
                    isVisible: false
                }]);
            } )
            .raise();
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
            .attr("stroke", feature => feature.isAirPlane ? "red" : "#0dff00")
            .attr("stroke-opacity", feature => 1)
            .attr("stroke-width", feature => 0.5)
            .attr("d", feature =>pathGenerator(feature))
            .raise();
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

        drawLakes(svg, isCoarse, isDaylight);

        if(!isDaylight){
            // drawLights(svg, false);
        }

        drawCurrentShadow(svg, isDaylight);
            
        drawGraticule(svg, isDaylight);

        drawCurrentLandmark(svg, isDaylight);

        drawArcs(svg, isDaylight);

        drawTempPath(svg, isDaylight);
        
        drawTempLandmark(svg, isDaylight);
        
        drawEditLandmark(svg, isDaylight);

        drawLandmarks(svg, isDaylight);

    };

    //Use effect hook.
    useEffect(() => {
        drawGlobe(oldCoordinates, scale, true);
        setIsMove(true);
    }, [scale])

    
    useEffect(() => {
        drawGlobe(oldCoordinates, scale, false);
    }, [landmarks, paths, tempPath, tempLandmark, currentLandmark, editLandmark])
    
    return (
        <svg width={size} height={size} ref={svgRef} style={{border:1 }}
            onMouseDown={onMouseDownHandler} 
            onMouseMove={onMouseMoveHandler} 
            onMouseUp={onMouseUpHandler}>
        </svg>
    );
}
 
export default Globe;