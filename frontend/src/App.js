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
const REACT_APP_BACKEND = process.env.REACT_APP_BACKEND || '';

function App() {
  // const classes = useStyles();
  const [userID, setUserID] = React.useState(2);
  const [scale, setScale] = React.useState(1);
  const [paths, setPaths] = React.useState([]);
  const [landmarks, setLandmarks] = React.useState([]);
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

  const getUserPaths = () => {
    fetch(`${REACT_APP_BACKEND}/paths?userID=${userID}`)
    .then(res => res.json())
    .then(res => setPaths(res));
  };

  const getUserLandmarks = () => {
    fetch(`${REACT_APP_BACKEND}/landmarks?userID=${userID}`)
    .then(res => res.json())
    .then(res => setLandmarks(res));
  };

  useEffect(() => {
    getUserLandmarks();
    getUserPaths();
  }, []);

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
              <Tab label="New Landmark" />
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
