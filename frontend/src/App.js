import './App.css';
import Globe from './Globe';
import Slider from '@material-ui/core/Slider';
import React, { Component, useState, useRef, useEffect } from "react";
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import LandmarkInfo from './LandmarkInfo';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import NewLandmarkTab from './NewLandmarkTab';
import NewPathTab from './NewPathTab'

// const useStyles = theme => ({
//   buttonPadding: {    
//     padding: '30px',   
//   },
// });

function App() {
  // const classes = useStyles();
  const [userID, setUserID] = React.useState("1");
  const [scale, setScale] = React.useState(1);
  const [paths, setPaths] = React.useState([
    {type: "LineString", coordinates: [[-122.810850, 49.191663], [114.1694, 22.3193]], id:"userId_pathId0", isAirPlane: true},
    {type: "LineString", coordinates: [[114.1694, 22.3193], [120.9842, 14.5995]], id:"userId_pathId1", isAirPlane: true},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [144.9631, -37.8136]], id:"userId_pathId2", isAirPlane: true},
    {type: "LineString", coordinates: [[-122.810850, 49.191663], [-73.7781, 40.6413]], id:"userId_pathId3", isAirPlane: true},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [103.9915, 1.3644]], id:"userId_pathId4", isAirPlane: true},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [125.6455, 7.1304]], id:"userId_pathId5", isAirPlane: true},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [140.3929, 35.7720]], id:"userId_pathId6", isAirPlane: true},
    {type: "LineString", coordinates: [[120.9842, 14.5995], [-122.810850, 49.191663]], id:"userId_pathId7", isAirPlane: true},
    {type: "LineString", coordinates: [[-122.810850, 49.191663], [-156.0407, 19.7367]], id:"userId_pathId8", isAirPlane: true},
    {type: "LineString", coordinates: [[-122.810850, 49.191663], [-123.131479, 49.006889], [-123.878891, 49.224376], [-123.892490, 49.161571]], id:"userId_pathId9", isAirPlane: false}
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
      description: "Saw stuff\nabcd\naa",
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

  const getMinDimension = () => {
    // console.log("dimension calculated");
    return window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
  };

  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const [tempPath, setTempPath] = useState([{
    type: "LineString", 
    coordinates: [],
    isAirPlane: true
  }]);

  const [tempLandmark, setTempLandmark] = useState([{
    name: "",
    description: "",
    coordinates: [0, 0],
    isVisible: false
  }]);

  return (
    <div className="App">
      <Grid container spacing={0}>
        <Grid item xs={1} style={{ padding: 60 }}>
          <Typography id="vertical-slider" gutterBottom>
            Zoom
          </Typography>
          <Slider
            orientation="vertical" value={scale} onChange={handleChangeScale}
            aria-labelledby="vertical-slider" step={0.01}
            min={1}
            max={25}
            valueLabelDisplay="on"
          />
        </Grid>
        <Grid item xs={8} style={{ padding: 60 }}>
          <Globe scale={scale * getMinDimension()*0.6/2} 
            paths={paths} landmarks={landmarks} 
            landmarkHandler={setCurrentLandmark} 
            size={getMinDimension()*0.7} 
            tempPath={tempPath}
            tempLandmark={tempLandmark}/>
        </Grid>
        <Grid item xs={3} style={{ padding: 60 }} align="left">
          <AppBar position="static">
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example">
              <Tab label="Info" />
              <Tab label="New Landmark"  />
              <Tab label="New Path" />
            </Tabs>
          </AppBar>
          <LandmarkInfo currentLandmark={currentLandmark} value={tabValue} index={0}/>
          <NewLandmarkTab setLandmarks={setLandmarks} value={tabValue} index={1} userID={userID} setTempLandmark={setTempLandmark}/>
          <NewPathTab setPaths={setPaths} value={tabValue} index={2} userID={userID} setTempPath={setTempPath}/>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
