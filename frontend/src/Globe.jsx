//Imports from libraries
import React, { Component, useState, useRef, useEffect, useLayoutEffect } from "react";
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
import lightsFine1 from "./jsonData/geonames-all-cities-with-a-population-1000-5000-records.json";
import lightsCoarse from "./jsonData/cities-200000.json";//TODO: use if performance is fixed
import { Button, CircularProgress, FormHelperText, IconButton, LinearProgress, Typography } from "@material-ui/core";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

/**
 * Styles used for the component.
 * @param  {*} theme - the theme of the application
 */
const useStyles = makeStyles((theme) => ({
  root: {
    justifyContent:'center',
    alignItems:'center',
    textAlign: "center",
    position: 'relative',
    width: "100%",
    height: "100%"
  },
  zoomInButton: {
    display: "block",
    backgroundColor: "white",
    color: "black",
    '&:hover': {
      color: "white",
      backgroundColor: 'gray',
      boxShadow: 'none',
    },
    position: 'absolute',
    right: "90px",
    bottom: "150px",
  },
  zoomOutButton: {
    display: "block",
    backgroundColor: "white",
    color: "black",
    '&:hover': {
      color: "white",
      backgroundColor: 'gray',
      boxShadow: 'none',
    },
    position: 'absolute',
    right: "90px",
    bottom: "90px",
  },
  renderText: {
    position: 'absolute',
    left: "30px",
    bottom: '30px',
  },
  svgStyle: {
    width: "100%",
    height: "100%"
  }
}));

const QUARTER_DIAMETER = 12742/4.0;

function Globe({size, paths, landmarks, landmarkHandler, newPath, newLandmark, currentLandmark, editLandmark, subSolarCoordinates, editPath, locateLandmarkCoordinates, setLocateLandmarkCoordinates}) {
    
  const classes = useStyles();
  
  //States
  const [mouseCoordinates, setMouseCoordinates] = useState(null);         //state for initially pressing down the mouse button's position
  const [oldCoordinates, setOldCoordinates] = useState([180, -25]);   //state for the position of the globe during inactivity (units in -longitude, -latitude)
  const [newCoordinates, setNewCoordinates] = useState(null);             //state for updating the old coordinates
  const [isMove, setIsMove] = useState(false);                        //state for when a user has queued up the fact that the globe has been changed somehow that lowered the resolution and will be rendered back to full resolution
  const [isDrag, setIsDrag] = useState(false);                        //state for whether or not the user is dragging the globe (moving the mouse while mouse is down)
  const [isLoading, setIsLoading] = useState(false);
  const [renderText, setRenderText] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [scale, setScale] = useState(1);

  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [isRefReady, setIsRefReady] = useState(false);

  //Constants
  const svgRef = useRef();
  const circle = d3.geoCircle();
  const twilightRadians = 1.396;
  const halfGlobeRadians = 1.57;
  const projection = d3.geoOrthographic()
    .fitSize([width, height], {type: "Sphere"})
    .clipAngle(90)
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
   * @param {number} population - the population of the city
   */
  const getCityRadius = (population) => {
    if (population < 100000)
      return 0.08
    else if (population < 200000)
      return 0.1
    else if (population < 300000)
      return 0.12
    else if (population < 500000)
      return 0.14
    else
      return 0.2
  };

  /**
   * Handles when the user has become idle.
   * @param {*} event - the event during idle.
   */
  const handleOnIdle = event => {
    if(isMove && !isDrag) {
      //the globe is not being dragged which means that the globe should be rendered fully
      setIsMove(false);
      setIsLoading(true);
      setRenderText(`Rendering full resolution...`);
      setTimeout(() => {
        drawGlobe(oldCoordinates, false);
        setIsLoading(false);
      }, 400);
    } else if (isMove && isDrag) {
      //the globe is still being dragged
      reset();
    } else {
      console.log("do nothing when idle because the globe wasn't moved in the first place");
    }
  }
    
  /**
   * Handles when the user has become active.
   * @param {*} event - the event during active
   */
  const handleOnActive = event => {

  }
    
  /**
   * Handles when the user has done an action.
   * @param {*} event - the event during an action
   */
  const handleOnAction = (event) => {}
     
  //Idle timer and parameters
  const { getRemainingTime, getLastActiveTime, resume, pause, reset } = useIdleTimer({
    timeout: 1000 * 2,
    onIdle: handleOnIdle,
    onActive: handleOnActive,
    onAction: handleOnAction,
    events: ['mouseup', 'mousewheel', 'keydown'],
    debounce: 500
  })

  /**
   * Handler for when the mouse has been moved.
   * @param {*} event - the event of when the mouse has been moved
   */
  const onMouseMoveHandler = (event) => {
    //TODO: fix fine rendering issue
    if(mouseCoordinates){
      var currentMouseCoordinates = [event.screenX, event.screenY];
      var scalingFactor = 3.0 * getRealScale()/200.0;
      var movedCoordinates = [oldCoordinates[0] + (currentMouseCoordinates[0] - mouseCoordinates[0])/scalingFactor, oldCoordinates[1] - (currentMouseCoordinates[1] - mouseCoordinates[1])/scalingFactor];
      movedCoordinates[1] = movedCoordinates[1] < -90 ? -90 :
        movedCoordinates[1] > 90 ?  90 : movedCoordinates[1];
      setNewCoordinates(movedCoordinates);
      setIsMove(true);
      setIsDrag(true);
      drawGlobe(movedCoordinates, true);
    }
  };

  /**
   * Handler when the mouse click is now up.
   * @param {*} event - the event of when the mouse click is now up
   */
  const onMouseUpHandler = (event) => {
    if(newCoordinates){
      setOldCoordinates([modulo(newCoordinates[0] - 180, 360) - 180, newCoordinates[1]]);
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
      if(currentLandmark.isVisible){
        landmarkHandler(false, null);
      }
    });
  };

  /**
   * Draws the grid.
   * @param {*} svg - the svg used to draw the graticule.
   * @param {boolean} isDaylight - the parameter for night time styles.
   */
  const drawGraticule = (svg, isDaylight) => {
    const graticule = d3.geoGraticule10();
    svg
    .selectAll(".mesh")
    .data([graticule])
    .join("path")
    .attr("class", "mesh")
    .attr("fill-opacity","0")
    .attr("stroke", isDaylight ? "#ccf" : "gray")
    .attr("stroke-opacity", "0.5")
    .attr("stroke-width", isDaylight ? 1 : 0.3)
    .attr("d", feature => pathGenerator(feature))
    .on("click", (mouseEvent, item) => {
      if(currentLandmark.isVisible){
        landmarkHandler(false, null);
      }
    })
    .raise();
  };

  /**
   * Draws the land.
   * @param {*} svg - the svg used to draw the land
   * @param {boolean} isCoarse - the parameter for fine detail or coarse detail
   * @param {boolean} isDaylight - the parameter for night time styles
   */
  const drawLand = (svg, isCoarse, isDaylight) => {
    //Using local json data that is of type Topology
    const land = isCoarse ? landCoarse.features : landFine.features;
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
      if(currentLandmark.isVisible){
        landmarkHandler(false, null);
      }
    })
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

  /**
   * Draws the land outline.
   * @param {*} svg - the svg used to draw the land outline
   * @param {boolean} isCoarse - the parameter for fine detail or coarse detail
   * @param {boolean} isDaylight - the parameter for night time styles
   */
  const drawLandOutline = (svg, isCoarse, isDaylight) => {
    //Using local json data that is of type Topology
    const land = isCoarse ? landCoarse.features : landFine.features;
    svg
    .selectAll(".countryOutline")
    .data(land)
    .join("path")
    .attr("class", "countryOutline")
    .attr("fill-opacity", "0")
    .attr("stroke", "#b89463")
    .attr("stroke-width", 0.3)
    // .attr("stroke-opacity", "0.8")
    .attr("d", feature => pathGenerator(feature))
    .on("click", (mouseEvent, item) => {
      if(currentLandmark.isVisible){
        landmarkHandler(false, null);
      }
    })
    .raise();
  };

  /**
   * Draws the lakes.
   * @param {*} svg - the svg used to draw the land
   * @param {boolean} isCoarse - the parameter for fine detail or coarse detail
   * @param {boolean} isDaylight - the parameter for night time styles
   */
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
      if(currentLandmark.isVisible){
        landmarkHandler(false, null);
      }
    });
  };

  /**
   * Draws the lake outline.
   * @param {*} svg - the svg used to draw the lake outline
   * @param {boolean} isCoarse - the parameter for fine detail or coarse detail
   * @param {boolean} isDaylight - the parameter for night time styles
   */
  const drawLakesOutline = (svg, isCoarse, isDaylight) => {
    const lakes = isCoarse ? lakesCoarse.features :lakesFine.features;
    svg
    .selectAll(".lakesOutline")
    .data(lakes)
    .join("path")
    .attr("class", "lakesOutline")
    .attr("fill-opacity", "0")
    .attr("stroke", isDaylight ? "#faa" : "#b89463")
    .attr("stroke-width", 0.3)
    .attr("d", feature => pathGenerator(feature))
    .raise()
    .on("click", (mouseEvent, item) => {
      if(currentLandmark.isVisible){
        landmarkHandler(false, null);
      }
    });
  };

  /**
   * Draws city lights based on population sizes in cities.
   * @param {*} svg - the svg used to draw city lights
   * @param {boolean} isCoarse - the parameter for fine detail or coarse detail
   */
  const drawLights = (svg, isCoarse, rotateParams) => {
    var nightLongitude = subSolarCoordinates[0] + 180;
    var nightLatitude = -subSolarCoordinates[1];
    if(isCoarse){
      svg
      .selectAll(".lights")
      .data(lightsCoarse.filter((d) => isCoarseLightsInView(d, [nightLongitude, nightLatitude], rotateParams)))
      .join("path")
      .attr("class", "lights")
      .style("fill", "#ff8")
      .attr("fill-opacity","0.4")
      .attr("d", cityElement => pathGenerator(circle.center([parseFloat(cityElement[3]), parseFloat(cityElement[2])]).radius(getCityRadius(cityElement[0]))()))
      .raise();
    }else{
      svg
        .selectAll(".lights")
        .data(lightsFine1.records.filter((d) => isFineLightsInView(d, [nightLongitude, nightLatitude], rotateParams)))
        .join("path")
        .attr("class", "lights")
        .style("fill", "#ff8")
        .attr("fill-opacity","0.4")
        .attr("d", cityElement => pathGenerator(circle.center(cityElement.geometry.coordinates).radius(getCityRadius(cityElement.fields.population))()))
        .raise();
    }
  };

  /**
   * Checks if the landmark for coarse city lights is in view for the user
   * @param {*} landmark - the landmark object
   * @param {*} nightCoordinates - the night coordinates in [long, lat]
   * @param {*} rotateParams - the rotate parameters in [long, lat]
   * @returns - a boolean
   */
  const isCoarseLightsInView = (landmark, nightCoordinates, rotateParams) => {
    const gdistance = d3.geoDistance([parseFloat(landmark[3]), parseFloat(landmark[2])], nightCoordinates);
    return gdistance < twilightRadians;
  }

  /**
   * Checks if the landmark for fine city lights is in view for the user
   * @param {*} landmark - the landmark object
   * @param {*} nightCoordinates - the night coordinates in [long, lat]
   * @param {*} rotateParams - the rotate parameters in [long, lat]
   * @returns - a boolean 
   */
  const isFineLightsInView = (landmark, nightCoordinates, rotateParams) => {
    const gdistance = d3.geoDistance(landmark.geometry.coordinates, nightCoordinates);
    return gdistance < twilightRadians;
  }

  /**
   * Draws the landmarks.
   * @param {*} svg - the svg used to draw the landmarks
   * @param {boolean} isDaylight - the parameter used for night time styles
   */
  const drawLandmarks = (svg, isDaylight, rotateParams) => {
    // Format of one element of data
    //   {
    //     id: "landmark_1",
    //     landmark_uid: 1,
    //     name: "Manila / Marikina",
    //     description: "First Hometown. Revisited 2011, 2013, 2017, 2018, and 2019.",
    //     coordinates: [120.9842, 14.5995]
    //   }
    // console.log(landmarks);

    var nightLongitude = subSolarCoordinates[0] + 180;
    var nightLatitude = -subSolarCoordinates[1];
    svg
    .selectAll(".landmarks")
    .data(landmarks)
    .join("path")
    .attr("class", "landmarks")
    .attr("id", landmark => `${landmark.id}`)
    .style("fill", landmark => isInTwilight(landmark, [nightLongitude, nightLatitude]) ? "white" : "black")
    .style("stroke", landmark => isInTwilight(landmark, [nightLongitude, nightLatitude]) ? "white" : "black")
    .attr("stroke-width", 0.2)
    .attr("fill-opacity","0.3")
    .on("mouseover", (mouseEvent, item) => {
      d3.select(`#${item.id}`)
      .style("fill", "red")
      .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.3)()));
    } )
    .on("mouseout", (mouseEvent, item) => {
      d3.select(`#${item.id}`)
      .style("fill", landmark => isInTwilight(landmark, [nightLongitude, nightLatitude]) ? "white" : "black")
      .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)()));
    } )
    .on("click", (mouseEvent, item) => {
      landmarkHandler(true, item);
    })
    .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)()))
    .raise();
  };

  const isInTwilight = (landmark, nightCoordinates) => {
    const gdistance = d3.geoDistance(landmark.coordinates, nightCoordinates);
    return gdistance < halfGlobeRadians;
  }

  /**
   * Draws the current selected landmark.
   * @param {*} svg - the svg used to draw the current selected landmark
   * @param {boolean} isDaylight - the parameter used for night time styles
   */
  const drawCurrentLandmark = (svg, isDaylight) => {
    // console.log("this is the current landmark from draw landmark", currentLandmark);
    //format of one element of data
    // {
    //     coordinates: [0, 0],
    //     isVisible: false
    // }
    svg
    .selectAll(".currentLandmark")
    .data([currentLandmark])
    .join("path")
    .attr("class", "currentLandmark")
    .attr("id", landmark => `current_${landmark.landmark_uid}`)
    .style("fill", "red")
    .attr("fill-opacity","0.3")
    .attr("visibility", landmark => landmark.isVisible ? "visible" : "hidden")
    .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.2)()))
    .raise();
  };

  /**
   * Draws the current world night time.
   * @param {*} svg - the svg used to draw the world night time
   * @param {boolean} isDaylight - the parameter used for night time styles
   */
  const drawCurrentShadow = (svg, isDaylight) => {
    var nightLongitude = subSolarCoordinates[0] + 180;
    var nightLatitude = -subSolarCoordinates[1];
    var opacity = "0.3";
    svg
    .selectAll(".shadow")
    .data([90, 90-6, 90-12, 90-18])
    .join("path")
    .attr("class", "shadow")
    .attr("id", `shadow`)
    .style("fill", "black")
    .attr("fill-opacity",opacity)
    .attr("d", data => pathGenerator(circle.center([nightLongitude, nightLatitude]).radius(data)()))
    .raise()
    .on("click", (mouseEvent, item) => {
      if(currentLandmark.isVisible){
        landmarkHandler(false, null);
      }
    });
  };

  /**
   * Draws the current new landmark.
   * @param {*} svg - the svg used to draw the current new landmark
   * @param {boolean} isDaylight - the parameter used for night time styles
   */
  const drawTempLandmark = (svg, isDaylight) => {
    //format of one element of data
    // {
    //     coordinates: [0, 0],
    //     isVisible: false
    //   }
    svg
    .selectAll(".newLandmark")
    .data([newLandmark])
    .join("path")
    .attr("class", "newLandmark")
    .attr("id", `newLandmark`)
    .style("fill", "red")
    .attr("fill-opacity","0.5")
    .attr("visibility", landmark => landmark.isVisible ? "visible" : "hidden")
    .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)()))
    .raise();
  };

  /**
   * Draws the current modified landmark.
   * @param {*} svg - the svg used to draw the current modified landmark
   * @param {boolean} isDaylight - the parameter used for night time styles
   */
  const drawEditLandmark = (svg, isDaylight) => {
    //format of one element of data
    // {
    //     coordinates: [0, 0],
    //     isVisible: false
    //   }
    svg
    .selectAll(".editLandmark")
    .data([editLandmark])
    .join("path")
    .attr("class", "editLandmark")
    .attr("id", landmark => `edit`)
    .style("fill", "#73ff00")
    .attr("fill-opacity","0.5")
    .attr("stroke-width", 1)
    .attr("stroke","black")
    .attr("visibility", landmark => landmark.isVisible ? "visible" : "hidden")
    .attr("d", landmark => pathGenerator(circle.center([landmark.coordinates[0], landmark.coordinates[1]]).radius(0.1)()))
    .raise();
  };

  /**
   * Draws the arcs.
   * @param {*} svg - the svg used to draw the arcs
   * @param {boolean} isDayTime - the parameter used for night time styles
   */
  const drawArcs = (svg, isDayTime) => {
    //The format of one element of data is 
    // { 
    //   type: "LineString", 
    //   coordinates: [[0, 0], ...], 
    //   id:"path_x", 
    //   path_uid: x, 
    //   isAirPlane: true
    // }
    svg
    .selectAll(".arcOutline")
    .data(paths)
    .join("path")
    .attr("class", "arcOutline")
    // .transition()
    .attr("fill-opacity", "0")
    .attr("stroke-opacity", feature => feature.isAirPlane ? 0.5 : 1)
    .attr("stroke", feature => isDayTime ? "black" : "white")
    .attr("stroke-width", feature => feature.isAirPlane ? 0.8 : 0.2)
    .attr("d", feature =>pathGenerator(feature))
    .raise()
    .on("click", (mouseEvent, item) => {
      if(currentLandmark.isVisible){
        landmarkHandler(false, null);
      }
    })
    .raise();
      
    svg
    .selectAll(".arc")
    .data(paths)
    .join("path")
    .attr("class", "arc")
    // .transition()
    .attr("fill-opacity", "0")
    .attr("stroke-opacity", feature => feature.isAirPlane ? 0.5 : 1)
    .attr("stroke", feature => isDayTime ? "black" : "black")
    .attr("stroke-width", feature => feature.isAirPlane ? 1 : 0.5)
    .style("stroke-dasharray", feature => feature.isAirPlane ? ("15, 3") : ("3", "3"))
    .attr("d", feature =>pathGenerator(feature))
    .raise()
    .on("click", (mouseEvent, item) => {
      if(currentLandmark.isVisible){
        landmarkHandler(false, null);
      }
    })
    .raise();
  };

  /**
   * Draws the current new path.
   * @param {*} svg - the svg used to draw the current new path
   * @param {boolean} isDayTime - the parameter used for night time styles
   */
  const drawTempPath = (svg, isDayTime) => {
    //format of one element of data
    // {
    //     type: "LineString", 
    //     coordinates: [],
    //     isAirPlane: true
    //   }
    // console.log(newPath);
    // console.log(newPath)
    svg
    .selectAll(".newPath")
    .data([newPath])
    .join("path")
    .attr("class", "newPath")
    // .transition()
    .attr("fill-opacity","0")
    .attr("stroke", feature => feature.isAirPlane ? "red" : "red")
    .style("stroke-dasharray", feature => feature.isAirPlane ? ("15, 3") : ("3", "3"))
    .attr("stroke-opacity", feature => 1)
    .attr("stroke-width", feature => 1)
    .attr("d", feature =>pathGenerator(feature))
    .raise();
  };

  /**
   * Draws the current modified path.
   * @param {*} svg - the svg used to draw the current modified path
   * @param {boolean} isDaylight - the parameter used for night time styles
   */
  const drawEditPath = (svg, isDayTime) => {
    //format of one element of data
    // {
    //     type: "LineString",
    //     coordinates: [],
    //     isAirPlane: true
    // }
    svg
    .selectAll(".editPath")
    .data([editPath])
    .join("path")
    .attr("class", "editPath")
    .attr("fill-opacity","0")
    .attr("stroke", feature => feature.isAirPlane ? "#73ff00" : "#73ff00")
    .style("stroke-dasharray", feature => feature.isAirPlane ? ("15, 3") : ("3", "3"))
    .attr("stroke-opacity", feature => 1)
    .attr("stroke-width", feature => 1)
    .attr("d", feature =>pathGenerator(feature))
    .raise();
  };

  /**
   * Draws the scale.
   * @param {*} svg - the svg used to draw the scale
   */
  const drawScale = (svg) => {

    var lineGenerator = d3.line();
    var minDimension = Math.min(width, height);
    svg
    .selectAll(".scale")
    .data([1])
    .join("path")
    .attr("class", "scale")
    // .append('path')
    .style("stroke", "white")
    .style("stroke-width", 1)
    .style("fill-opacity", 0)
    .style("stroke-opacity", 1)
    .attr("d", lineGenerator([
      [width * 0.73, height - 30], 
      [width * 0.73, height - 30 + 10], 
      [width * 0.73 + minDimension/4.0, height - 30 + 10], 
      [width * 0.73 + minDimension/4.0, height - 30]
    ]))
    .raise();
    
    svg
    .selectAll(".textScale")
    .data([1])
    .join("text")
    .attr("class", "textScale")
    .attr("dx", width * 0.73 + minDimension/8.0)
    .attr("dy", height - 30)
    .style("text-anchor", "middle")
    .style("fill", "white")
    .text(`${Math.ceil(QUARTER_DIAMETER/scale * 100)/100} km`)
    .raise();
  }

  /**
   * Draws the globe.
   * @param {Array<number>} rotateParams - the rotation parameters to position the globe
   * @param {number} scaleParams - the scale parameter to scale the globe
   * @param {boolean} isCoarse - the parameter for fine detail or coarse detail
   */
  const drawGlobe = (rotateParams, isCoarse) => {
    const svg = d3.select(svgRef.current);
    projection.rotate(rotateParams).scale(getRealScale());

    var isDaylight = false;
    
    drawSphere(svg, isDaylight);
    drawLand(svg, isCoarse, isDaylight);
    drawLakes(svg, isCoarse, isDaylight);
    drawCurrentShadow(svg, isDaylight);

    drawLandOutline(svg, isCoarse, isDaylight);
    drawLakesOutline(svg, isCoarse, isDaylight);

    if(!isDaylight){
      drawLights(svg, isCoarse, rotateParams);
    }
    
    drawGraticule(svg, isDaylight);    

    drawCurrentLandmark(svg, isDaylight);
    drawArcs(svg, isDaylight);
    drawTempPath(svg, isDaylight);
    drawTempLandmark(svg, isDaylight);
    drawEditPath(svg, isDaylight);
    drawEditLandmark(svg, isDaylight);
    drawLandmarks(svg, isDaylight, rotateParams);

    drawScale(svg);
  };

  const getRealScale = () => {
    return scale * Math.min(width, height)/2.0;
  }

  /**
   * Handles the mouse wheel event.
   * @param {*} event - the event triggered
   */
  const mouseWheelHandler = (event) => {
    setScale(prev => {
      let newVal = prev - event.deltaY/110;
      return Math.min(Math.max(newVal, 1), 25.484);
    });
  };

  /**
   * Handles the zoom in event.
   */
  const zoomInHandler = () => {
    setScale(prevVal => Math.min(prevVal + 1, 25.484));
  }

  /**
   * Handles the zoom out event.
   */
  const zoomOutHandler = () => {
    setScale(prevVal => Math.max(prevVal - 1, 1));
  }

  /**
   * Renders the external message while rendering the globe.
   * @param {string} message 
   * @param {boolean} isCoarse 
   */
  const renderExternalUpdate = (message, isCoarse) => {
    setIsLoading(true);
    setRenderText(message);
    setTimeout(() => {
      drawGlobe(oldCoordinates, isCoarse);
      setIsLoading(false);
      if(isCoarse){
        setIsMove(true);
      }
    }, isCoarse ? 100 : 800);
  }

  const modulo = (a, n) => {
    return ((a % n ) + n ) % n;
  };

  //Use effect hook.
  useEffect(() => {
    if(!isInitialLoad){
      drawGlobe(oldCoordinates, true);
      setIsMove(true);
    }
  }, [scale])

  useEffect(() => {
    if(!isInitialLoad && !isDrag && !isMove){
      // console.log("subsolar");
      renderExternalUpdate("Updating earth shadow...", isDrag);
    }
  }, [subSolarCoordinates])

  useEffect(() => {
    if(!isInitialLoad){
      // console.log("current landmark updated", currentLandmark);
      renderExternalUpdate("Rendering clicked landmark...", true);
    }
  }, [currentLandmark.isVisible, currentLandmark.coordinates])

  useEffect(() => {
    if(!isInitialLoad){
      setWidth(svgRef.current.clientWidth);
      setHeight(svgRef.current.clientHeight);
      renderExternalUpdate("Rendering for resized window...", false);
    }
  }, [size])

  useEffect(() => {
    if(!isInitialLoad){
      // console.log("newLandmark", newLandmark);
      renderExternalUpdate("Rendering new landmark...", true);
    }
  }, [newLandmark])

  useEffect(() => {
    if(!isInitialLoad){
      // console.log("edit landmark");
      renderExternalUpdate("Rendering edited landmark...", true);
    }
  }, [editLandmark])

  useEffect(() => {
    if(!isInitialLoad){
      // console.log("edit path");
      renderExternalUpdate("Rendering edited path...", true);
    }
  }, [editPath.coordinates, editPath.isAirPlane])

  useEffect(() => {
    if(!isInitialLoad){
      // console.log("new path");
      renderExternalUpdate("Rendering new path...", true);
    }
  }, [newPath])

  useEffect(() => {
    if(!isInitialLoad){
      // console.log("paths");
      renderExternalUpdate("Updating paths...", false);
    }
  }, [paths])

  useEffect(() => {
    if(!isInitialLoad){
      // console.log("else");
      renderExternalUpdate("Updating landmarks...", false);
    }
  }, [landmarks])

  useEffect(() => {
    if(locateLandmarkCoordinates) {
        setIsLoading(true);
        setRenderText(`Locating landmark...`);
        d3.transition()
        .duration(3000)
        .tween("rotate", function() {
          const longArray = [
            -locateLandmarkCoordinates[0] + 360 - oldCoordinates[0], 
            -locateLandmarkCoordinates[0] - oldCoordinates[0], 
            -locateLandmarkCoordinates[0] - 360 - oldCoordinates[0]];
          let amount = Number.MAX_VALUE;
          let isPositive = true;
          for(let i = 0; i < longArray.length; i++){
            if(amount > Math.abs(longArray[i])){
              amount = Math.abs(longArray[i]);
              isPositive = longArray[i] > 0;
            }
          }
          const r = d3.interpolate(oldCoordinates, [oldCoordinates[0] + (isPositive ? 1 : -1) * amount, -locateLandmarkCoordinates[1]]);
          return function(t) {
            if(t === 1){
              setRenderText(`Rendering full resolution...`);
              setLocateLandmarkCoordinates(null);
              setTimeout(() => {
                drawGlobe(r(t), false);
                setIsLoading(false);
              }, 100);
            }
            else{
              drawGlobe(r(t), true);
            }
            
            const coordinatesToUse = [modulo(r(t)[0] - 180, 360) - 180, r(t)[1]];
            setOldCoordinates(coordinatesToUse);
          }
        })
    }
    
  }, [locateLandmarkCoordinates])

  useLayoutEffect(() => {
    setWidth(svgRef.current.clientWidth);
    setHeight(svgRef.current.clientHeight);
    setIsRefReady(true);
  }, []);

  useEffect(() => {
    if(isRefReady) {
      setIsLoading(true);
      setRenderText("Rendering globe...");
      setTimeout(() => {
        drawGlobe(oldCoordinates, false);
        setIsLoading(false);
        setIsInitialLoad(false);
      }, 800);
    }
  }, [width, height, isRefReady])

  return (
    <div className={classes.root}>
      <svg className={classes.svgStyle} ref={svgRef}
        onMouseDown={onMouseDownHandler} 
        onMouseMove={onMouseMoveHandler} 
        onMouseUp={onMouseUpHandler}
        onWheel={mouseWheelHandler}>
      </svg>
      <IconButton  size="medium" variant="contained" className={classes.zoomInButton} onClick={zoomInHandler}>
        <AddIcon/>
      </IconButton>
      <IconButton  size="medium" variant="contained" className={classes.zoomOutButton} onClick={zoomOutHandler}>
        <RemoveIcon/>
      </IconButton>
      {isLoading && <Typography className={classes.renderText}>{renderText}</Typography>}
    </div>
  );
}
 
export default Globe;