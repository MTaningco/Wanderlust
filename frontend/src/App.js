import logo from './logo.svg';
import './App.css';
import Globe from './Globe';
import * as d3 from 'd3';
import * as topojson from "topojson";
import data from "./GeoChart.world.geo.json";
import Slider from '@material-ui/core/Slider';
import React, { Component, useState, useRef, useEffect } from "react";
import { Grid } from '@material-ui/core';
import { withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

// const useStyles = theme => ({
//   buttonPadding: {    
//     padding: '30px',   
//   },
// });

function App() {
  const minEarthRadius = 450;
  // const classes = useStyles();
  const [scale, setScale] = React.useState(1);
  const [paths, setPaths] = React.useState([
    {type: "LineString", coordinates: [[-122.810850, 49.191663], [114.1694, 22.3193]]},
    {type: "LineString", coordinates: [[114.1694, 22.3193], [120.9842, 14.5995]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [144.9631, -37.8136]]},
    {type: "LineString", coordinates: [[-122.810850, 49.191663], [-73.7781, 40.6413]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [103.9915, 1.3644]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [125.6455, 7.1304]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [140.3929, 35.7720]]},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [-122.810850, 49.191663]]},
    {type: "LineString", coordinates: [[-122.810850, 49.191663], [-156.0407, 19.7367]]},
    {type: "LineString", coordinates: [[-122.810850, 49.191663], [-123.131479, 49.006889], [-123.878891, 49.224376], [-123.892490, 49.161571]]}
  ]);
  
  const [landmarks, setLandmarks] = React.useState([
    {
        id: "manila_ph",
        name: "Manila / Marikina",
        description: "First Hometown. Revisited 2011, 2013, 2017, 2018, and 2019.",
        coordinates: [120.9842, 14.5995]
    },{
      id: "kyoto_ja",
      name: "Kyoto, Japan",
      description: "Saw stuff",
      coordinates: [135.7681, 35.0116]
    },{
      id: "osaka_ja",
      name: "Osaka, Japan",
      description: "Saw stuff",
      coordinates: [135.5023, 34.6937]
    },{
      id: "vancouver_ca",
      name: "Vancouver, Canada",
      description: "Saw stuff",
      coordinates: [-122.810850, 49.191663]
    },{
      id: "mauna_kea_hawaii",
      name: "Mauna Kea, Hawaii",
      description: "Saw stuff",
      coordinates: [-155.4681, 19.8206]
    },{
      id: "washington_dc_usa",
      name: "Washington D.C., USA",
      description: "Saw stuff",
      coordinates: [-77.0369, 38.9072]
    },{
      id: "badwater_california",
      name: "Badwater Basin, Death Valley, California",
      description: "Saw stuff",
      coordinates: [-116.8185, 36.2461]
    },{
      id: "montemar_ph",
      name: "Montemar, Philippines",
      description: "Saw stuff",
      coordinates: [120.3935, 14.5865]
    },{
      id: "lac_la_hache_ca",
      name: "Lac La Hache, Canada",
      description: "Saw stuff",
      coordinates: [-121.529595, 51.808729]
    },{
      id: "tofino_ca",
      name: "Tofino, Canada",
      description: "Saw stuff",
      coordinates: [-125.913095, 49.146747]
    },{
      id: "hole_in_the_wall_port_alberni_ca",
      name: "Hole In The Wall, Port Alberni, Canada",
      description: "Saw stuff",
      coordinates: [-124.748174, 49.260497]
    }
  ]);

  const [currentLandmark, setCurrentLandmark] = React.useState(null);

  // const clientHeight = document.getElementById('globeGrid').clientHeight;

  const handleChangeScale = (event, newValue) => {
    setScale(newValue);
  };

  
  // const getWindowDimension = () => {
  //   var width = document.getElementById('globeGrid').offsetWidth;
  //   var height = document.getElementById('globeGrid').offsetHeight;
  //   console.log(width < height ? width : height);
  //   return width < height ? width : height;
  // };

  const getLandmarkInfo = () => {
    if(currentLandmark){
      // return (`${currentLandmark.name}\n${currentLandmark.description}`)
      return (
        <div>
          <Typography variant="h4">
            {currentLandmark.name}
          </Typography>
          <Typography variant="h6">
            {currentLandmark.description}
          </Typography>
        </div>
      );
    }
  };

  return (
    <div className="App">
      <Grid container spacing={0} style={{ padding: 60 }}>
        <Grid item xs={11} id="globeGrid">
          <Globe scale={scale * minEarthRadius} paths={paths} landmarks={landmarks} landmarkHandler={setCurrentLandmark} size={minEarthRadius*2} />
        </Grid>
        <Grid item xs={1}>
          <Slider
            orientation="vertical" value={scale} onChange={handleChangeScale}
            aria-labelledby="vertical-slider" step={0.01}
            min={1}
            max={25}  
            valueLabelDisplay="on"
          />
        </Grid>
        <Grid item xs={12}>
          {getLandmarkInfo()}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
