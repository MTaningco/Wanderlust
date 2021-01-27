import './App.css';
import Globe from './Globe';
import React, { Component, useState, useRef, useEffect } from "react";
import { Button, Grid, Toolbar, Typography } from '@material-ui/core';
import LandmarkInfo from './LandmarkInfo';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import NewLandmarkTab from './NewLandmarkTab';
import NewPathTab from './NewPathTab';
import InfoIcon from '@material-ui/icons/Info';
import RoomIcon from '@material-ui/icons/Room';
import TimelineIcon from '@material-ui/icons/Timeline';
import ZoomSlider from './ZoomSlider';
import {  Redirect } from "react-router-dom";

function Dashboard() {
  // const classes = useStyles();
  //States
  const [scale, setScale] = useState(1);
  const [tabValue, setTabValue] = useState(0);

  const [isAuth, setIsAuth] = useState(true);
  const [paths, setPaths] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const [subSolarCoordinates, setSubSolarCoordinates] = useState([0, 0]);

  const [currentLandmark, setCurrentLandmark] = useState([{
    landmark_uid: -1,
    name: "",
    description: "",
    coordinates: [0, 0],
    isVisible: false
  }]);
  const [tempPath, setTempPath] = useState([{
    type: "LineString", 
    coordinates: [],
    isAirPlane: true
  }]);
  const [tempLandmark, setTempLandmark] = useState([{
    coordinates: [0, 0],
    isVisible: false
  }]);
  const [editLandmark, setEditLandmark] = useState([{
    coordinates: [0, 0],
    isVisible: false
  }]);

  // const clientHeight = document.getElementById('globeGrid').clientHeight;

  /**
   * Handles the scale change.
   * @param {*} event - the event of the scale change
   * @param {number} newValue - the value used to change the scale
   */
  const handleChangeScale = (event, newValue) => {
    setScale(newValue);
  };

  
  // const getWindowDimension = () => {
  //   var width = document.getElementById('globeGrid').offsetWidth;
  //   var height = document.getElementById('globeGrid').offsetHeight;
  //   console.log(width < height ? width : height);
  //   return width < height ? width : height;
  // };

  /**
   * Gets the minimum dimension of the browser window.
   */
  const getMinDimension = () => {
    // console.log("dimension calculated");
    return window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
  };

  /**
   * Handle's the tab change.
   * @param {*} event - the event of the tab change
   * @param {number} newValue - the value used to change the tab
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  /**
   * Gets the user's paths from the database.
   */
  const getUserPaths = () => {
    fetch(`/paths`, {
      headers: {
        'authorization' : `Bearer ${localStorage.getItem('token')}` 
      }
    })
    .then(res => res.json())
    .then(res => setPaths(res))
    .catch((error) => {
      invalidateAuth();
    });
  };

  /**
   * Gets the user's landmarks from the database.
   */
  const getUserLandmarks = () => {
    fetch(`/landmarks`, {
      headers: {
        'authorization' : `Bearer ${localStorage.getItem('token')}` 
      }
    })
    .then(res => res.json())
    .then(res => setLandmarks(res))
    .catch((error) => {
      invalidateAuth();
    });
  };

  /**
   * Invalidates the authorization of the user.
   */
  const invalidateAuth = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
  };

  /**
   * Gets the subsolar point from the backend.
   */
  const getSubsolarPoint = () => {
    fetch(`/sun`)
    .then(res => res.json())
    .then(res => {
      setSubSolarCoordinates([res.longitude, res.latitude]);
    });
  };

  /**
   * Updates the front end landmark.
   * @param {*} landmark - the landmark to be updated
   */
  const updateLandmarks = (landmark) => {
    let items = [...landmarks];
    for(var i = 0; i < items.length; i++){
      if(items[i].landmark_uid === landmark.landmark_uid){
        let itemToUpdate = {...items[i]};

        itemToUpdate.name = landmark.name;
        itemToUpdate.description = landmark.description;
        itemToUpdate.coordinates = landmark.coordinates;

        items[i] = itemToUpdate;

        setLandmarks(items);
        setCurrentLandmark([{
          landmark_uid: landmark.landmark_uid,
          name: landmark.name,
          description: landmark.description,
          coordinates: landmark.coordinates,
          isVisible: true
        }]);
        setEditLandmark([{
          coordinates: [0, 0],
          isVisible: false
        }]);
      }
    }
  };

  /**
   * Deletes the frontend landmark.
   * @param {number} landmark_uid - the landmark UID to be deleted.
   */
  const deleteLandmark = (landmark_uid) => {
    let items = [...landmarks];
    var index = -1;
    for(var i = 0; i < items.length; i++){
      if(items[i].landmark_uid === landmark_uid){
        index = i;
      }
    }
    if(index !== -1){
      items.splice(index, 1);
      setLandmarks(items);
      setCurrentLandmark([{
        landmark_uid: -1,
        name: "",
        description: "",
        coordinates: [0, 0],
        isVisible: false
      }]);
      setEditLandmark([{
        coordinates: [0, 0],
        isVisible: false
      }]);
    }
  };

  /**
   * Handles a new path called by the NewPathTab.
   * @param {*} newPath - the new temp path to compare against the previous state
   */
  const newPathHandler = (newPath) => {
    let isSameLength = newPath[0].coordinates.length === tempPath[0].coordinates.length;
    let isAirPlaneSame = newPath[0].isAirPlane === tempPath[0].isAirPlane;
    let isCoordinatesSame = true;
    if(isSameLength){
      for(var i = 0; i < newPath[0].coordinates.length; i++){
        if(newPath[0].coordinates[i][0] !== tempPath[0].coordinates[i][0] || newPath[0].coordinates[i][1] !== tempPath[0].coordinates[i][1]){
          isCoordinatesSame = false;
          break;
        }
      }
    }
    
    if(!isSameLength || !isAirPlaneSame || !isCoordinatesSame){
      setTempPath(newPath);
    }
  };

 // Use effect hook.
  useEffect(() => {
    getUserLandmarks();
    getUserPaths();
    getSubsolarPoint();
    const interval = setInterval(() => {
      getSubsolarPoint();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Gets the dashboard content.
   */
  const getDashboardContent = () => {
    if(isAuth){
      return (
        <Grid container spacing={0}>
          <Grid item xs={1} style={{ padding: 60, height:"90vh" }}>
            <ZoomSlider scale={scale} handleChangeScale={handleChangeScale}/>
          </Grid>
          <Grid item xs={7} style={{ padding: 60, height:"90vh" }}>
            <Globe scale={scale * getMinDimension()*0.8/2} 
              paths={paths} 
              landmarks={landmarks} 
              landmarkHandler={setCurrentLandmark} 
              size={getMinDimension()*0.8} 
              tempPath={tempPath}
              tempLandmark={tempLandmark}
              currentLandmark={currentLandmark}
              editLandmark={editLandmark}
              subSolarCoordinates={subSolarCoordinates}/>
          </Grid>
          <Grid item xs={4} style={{ padding: 60, height:"90vh" }} align="left">
            <AppBar position="static">
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth">
                <Tab style={{ minWidth: 25 }} icon={<InfoIcon/>}/>
                <Tab style={{ minWidth: 25 }} icon={<RoomIcon/>}/>
                <Tab style={{ minWidth: 25 }} icon={<TimelineIcon/>}/>
              </Tabs>
            </AppBar>
            <LandmarkInfo currentLandmark={currentLandmark} value={tabValue} index={0} setEditLandmark={setEditLandmark} updateLandmarks={updateLandmarks} invalidateAuth={invalidateAuth} deleteLandmark={deleteLandmark}/>
            <NewLandmarkTab setLandmarks={setLandmarks} value={tabValue} index={1} setTempLandmark={setTempLandmark} invalidateAuth={invalidateAuth}/>
            <NewPathTab setPaths={setPaths} value={tabValue} index={2} setTempPath={newPathHandler} invalidateAuth={invalidateAuth}/>
          </Grid>
        </Grid>
      );
    }
    else{
      return (<Redirect to={{pathname:'/loggedOut'}}/>);
    }
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Wanderlust
          </Typography>
          <Button variant="contained" color="primary" onClick={invalidateAuth}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      {getDashboardContent()}
    </div>
  );
}

export default Dashboard;
