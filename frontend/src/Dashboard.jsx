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
  const [isAuth, setIsAuth] = React.useState(true);
  const [scale, setScale] = React.useState(1);
  const [paths, setPaths] = React.useState([]);
  const [landmarks, setLandmarks] = React.useState([]);
  const [currentLandmark, setCurrentLandmark] = React.useState([{
    landmark_uid: -1,
    name: "",
    description: "",
    coordinates: [0, 0],
    isVisible: false
  }]);

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
    coordinates: [0, 0],
    isVisible: false
  }]);

  const [editLandmark, setEditLandmark] = useState([{
    coordinates: [0, 0],
    isVisible: false
  }]);

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

  const invalidateAuth = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
  };

  useEffect(() => {
    getUserLandmarks();
    getUserPaths();
  }, []);

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
              editLandmark={editLandmark}/>
          </Grid>
          <Grid item xs={4} style={{ padding: 60, height:"90vh" }} align="left">
            <AppBar position="static">
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth">
                <Tab style={{ minWidth: 25 }} icon={<InfoIcon/>}/>
                <Tab style={{ minWidth: 25 }} icon={<RoomIcon/>}/>
                <Tab style={{ minWidth: 25 }} icon={<TimelineIcon/>}/>
              </Tabs>
            </AppBar>
            <LandmarkInfo currentLandmark={currentLandmark} value={tabValue} index={0} setEditLandmark={setEditLandmark}/>
            <NewLandmarkTab setLandmarks={setLandmarks} value={tabValue} index={1} setTempLandmark={setTempLandmark} invalidateAuth={invalidateAuth}/>
            <NewPathTab setPaths={setPaths} value={tabValue} index={2} setTempPath={setTempPath} invalidateAuth={invalidateAuth}/>
          </Grid>
          {/* <Grid item xs={12} style={{ padding: 60}}>
            <Button variant="contained" color="primary" onClick={invalidateAuth}>
              Logout
            </Button>
          </Grid> */}
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
