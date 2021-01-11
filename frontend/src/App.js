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
import NewPathTab from './NewPathTab';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import SearchIcon from '@material-ui/icons/Search';
import InfoIcon from '@material-ui/icons/Info';
import RoomIcon from '@material-ui/icons/Room';
import TimelineIcon from '@material-ui/icons/Timeline';

//TODO: the token must be dynamically populated with a proper sign in page 
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3VpZCI6MTIsInVzZXJuYW1lIjoiam1pZ3N0IiwiaWF0IjoxNjEwMzU0MDQ2LCJleHAiOjE2MTAzNTc2NDZ9.ma15LYBF6Uigj8hbM2mMjgdrNhDYwn4VwUXSgfgpzZQ';
localStorage.setItem('token', token);

const theme = createMuiTheme({
  palette: {
    type: "dark",
  }
});

const marks = [
  {
    value: 1,
    label: 'Full View',
  },
  {
    value: 2,
    label: 'Half View',
  },
  {
    value: 4.24733333333,
    label: '3000 km',
  },
  {
    value: 8.49466666667,
    label: '1500 km',
  },
  {
    value: 12.742,
    label: '1000 km',
  },
  {
    value: 16.9893333333,
    label: '750 km',
  },
  {
    value: 21.2366666667,
    label: '600 km',
  },
  {
    value: 25.484,
    label: '500 km',
  },
  {
    value: 31.855,
    label: '400 km',
  },
  {
    value: 42.4733333333,
    label: '300 km',
  },
];

// const useStyles = theme => ({
//   buttonPadding: {    
//     padding: '30px',   
//   },
// });
const REACT_APP_BACKEND = process.env.REACT_APP_BACKEND || '';

function App() {
  // const classes = useStyles();
  // const [userID, setUserID] = React.useState(12);
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
    fetch(`/paths`, {
      headers: {
        'authorization' : `Bearer ${localStorage.getItem('token')}` 
      }
    })
    .then(res => res.json())
    .then(res => setPaths(res));
  };

  const getUserLandmarks = () => {
    fetch(`/landmarks`, {
      headers: {
        'authorization' : `Bearer ${localStorage.getItem('token')}` 
      }
    })
    .then(res => res.json())
    .then(res => setLandmarks(res));
  };

  useEffect(() => {
    getUserLandmarks();
    getUserPaths();
  }, []);
  // console.log(theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <div className="App">
        <Grid container spacing={0}>
          <Grid item xs={1} style={{ padding: 60 }}>
            <Typography id="vertical-slider" gutterBottom>
              <SearchIcon/>
            </Typography>
            <Slider
              orientation="vertical" value={scale} onChange={handleChangeScale}
              aria-labelledby="vertical-slider" step={0.01}
              min={1}
              max={25.484}
              marks={marks}
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
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth">
                <Tab style={{ minWidth: 25 }} icon={<InfoIcon/>}/>
                <Tab style={{ minWidth: 25 }} icon={<RoomIcon/>}/>
                <Tab style={{ minWidth: 25 }} icon={<TimelineIcon/>}/>
              </Tabs>
            </AppBar>
            <LandmarkInfo currentLandmark={currentLandmark} value={tabValue} index={0}/>
            <NewLandmarkTab setLandmarks={setLandmarks} value={tabValue} index={1} setTempLandmark={setTempLandmark}/>
            <NewPathTab setPaths={setPaths} value={tabValue} index={2} setTempPath={setTempPath}/>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}

export default App;
