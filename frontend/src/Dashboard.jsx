import './App.css';
import Globe from './Globe';
import React, { Component, useState, useRef, useEffect } from "react";
import { Box, Button, Divider, Drawer, Grid, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Paper, Toolbar, Typography } from '@material-ui/core';
import LandmarkInfo from './LandmarkInfo';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import OtherFeatureTab from './OtherFeatureTab';
import InfoIcon from '@material-ui/icons/Info';
import {  Redirect } from "react-router-dom";
import Skeleton from '@material-ui/lab/Skeleton';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import PaletteIcon from '@material-ui/icons/Palette';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import ListIcon from '@material-ui/icons/List';
const drawerWidth = 240;

/**
 * Styles used for the component.
 * @param  {*} theme - the theme of the application
 */
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  // necessary for content to be below app bar
  toolbar: {
    padding: 20,
    fontWeight: "bold"
  },
  toolbarMenu: {
    paddingTop: 20,
    paddingLeft: 20,
    fontWeight: "bold"
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: "#11255c"
  },
  globeGrid: {
    flexGrow: 1,
  },
  rightPanel: {
    // padding: 60, 
    height:"100vh",
    // borderLeft: 1
  },
}));

function Dashboard() {
  const classes = useStyles();
  //States
  const [tabValue, setTabValue] = useState(0);

  const [isAuth, setIsAuth] = useState(true);
  const [paths, setPaths] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const [subSolarCoordinates, setSubSolarCoordinates] = useState([0, 0]);
  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const open = Boolean(anchorEl);
  const [isPathsLoaded, setIsPathsLoaded] = useState(false);
  const [isLandmarksLoaded, setIsLandmarksLoaded] = useState(false);
  const [isSubSolarLoaded, setIsSubsolarLoaded] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  const [drawerValue, setDrawerValue] = useState(0);

  const [currentLandmark, setCurrentLandmark] = useState({
    landmark_uid: -1,
    name: "",
    description: "",
    coordinates: [0, 0],
    isVisible: false
  });
  const [tempPath, setTempPath] = useState([{
    type: "LineString", 
    coordinates: [],
    isAirPlane: true
  }]);
  const [newLandmark, setNewLandmark] = useState({
    coordinates: [0, 0],
    isVisible: false
  });
  const [editLandmark, setEditLandmark] = useState({
    coordinates: [0, 0],
    isVisible: false
  });
  const [editPath, setEditPath] = useState({
    type: "LineString",
    coordinates: [],
    isAirPlane: true
  });

  /**
   * Gets the minimum dimension of the browser window.
   */
  const getMinDimension = () => {
    return Math.min(windowSize.height, windowSize.width);
  };

  /**
   * Handles the tab change.
   * @param {*} event - the event of the tab change
   * @param {number} newValue - the value used to change the tab
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  /**
   * Handles switching to the information tab.
   * @param {*} landmark  - the current landmark
   */
  const toInformationTab = (landmark) => {
    setTabValue(0);
    setCurrentLandmark({...landmark, isVisible: true});
  };

  /**
   * Returns the order that the paths should be in.
   * @param {*} a - the first path argument
   * @param {*} b - the second path argument
   */
  const sortPaths = (a, b) => { 
    if(a["path_name"] === null && b["path_name"] === null){
      return 0;
    }
    else if(a["path_name"] === null){
      return 1;
    }
    else if(b["path_name"] === null){
      return -1;
    }
    else if(a["path_name"].toLowerCase() > b["path_name"].toLowerCase()){
      return 1;
    }
    else if(a["path_name"].toLowerCase() < b["path_name"].toLowerCase()){
      return -1;
    }
    return 0;  
  }

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
    .then(res => {
      res.sort(sortPaths);
      setPaths(res);
      setIsPathsLoaded(true);
    })
    .catch((error) => {
      invalidateAuth();
    });
  };

  /**
   * Returns the order that the landmarks should be in.
   * @param {*} a - the first landmark argument
   * @param {*} b - the second landmark argument
   */
  const sortLandmarks = (a, b) => {  
    if (a["name"].toLowerCase() > b["name"].toLowerCase()) {    
        return 1;    
    } else if (a["name"].toLowerCase() < b["name"].toLowerCase()) {    
        return -1;    
    }    
    return 0;  
  }

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
    .then(res => {
      res.sort(sortLandmarks);
      setLandmarks(res);
      setIsLandmarksLoaded(true);
    })
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
      setIsSubsolarLoaded(true);
    });
  };

  /**
   * Updates the front end landmark.
   * @param {*} landmark - the landmark to be updated
   */
  const updateLandmarks = (landmark, index) => {
    let items = [...landmarks];
    
    let itemToUpdate = {...items[index]};

    itemToUpdate.name = landmark.name;
    itemToUpdate.description = landmark.description;
    itemToUpdate.coordinates = landmark.coordinates;

    items[index] = itemToUpdate;

    if(landmark.landmark_uid == currentLandmark.landmark_uid){
      setCurrentLandmark({...landmark, isVisible: true});
    }
    setEditLandmark(prevVal => {
      const prevValCopy = {...prevVal};
      prevValCopy.isVisible = false;
      return prevValCopy;
    });
    setLandmarks(items.sort(sortLandmarks));
  };

  /**
   * Deletes the frontend landmark.
   * @param {number} landmark_uid - the landmark UID to be deleted.
   */
  const deleteLandmark = (landmark_uid, index) => {
    let items = [...landmarks];
    items.splice(index, 1);
    if(currentLandmark.landmark_uid == landmark_uid){
      setCurrentLandmark(prevVal => {
        const prevValCopy = {...prevVal};
        prevValCopy.isVisible = false;
        return prevValCopy;
      });
    }
    setLandmarks(items);
  };

  /**
   * Handles deleting the path
   * @param {*} index - the index of the path
   */
  const deletePath = (index) => {
    let pathsCopy = [...paths];
    pathsCopy.splice(index, 1);
    setPaths(pathsCopy);
    var editPath = [{
      type: "LineString",
      coordinates: [],
      isAirPlane: false
    }];
    setEditPath(editPath);
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

  /**
   * Handles clicking the account items.
   * @param {*} index - the index that was selected
   */
  const onAccountMenuClicked = (index) => {
    if(index === 1){
      invalidateAuth();
    }
  };

  /**
   * Handles changing the tab to the other feature tab.
   * @param {*} value 
   */
  const changeDrawerFeatureHandler = (value) => {
    setDrawerValue(value);
    setTabValue(1);
  }

  const currentLandmarkHandler = (isVisible, landmark) => {
    if(isVisible){
      setTabValue(0);
    }
    setCurrentLandmark(prevVal => {
      const prevValCopy = isVisible ? {...landmark} : {...prevVal};
      prevValCopy.isVisible = isVisible;
      return prevValCopy;
    });
  }

  const createLandmark = (landmark) => {
    setLandmarks(prevArray => {
      var newArray = [...prevArray, landmark];
      return newArray.sort(sortLandmarks);
    });
    setNewLandmark(prevVal => {
      const prevValCopy = {...prevVal}
      prevValCopy.isVisible = false;
      return prevValCopy
    });
  }

  const updateNewLandmark = (isVisible, coordinates) => {
    if(!isVisible){
      setNewLandmark(prevVal => {
        const prevValCopy = {...prevVal}
        prevValCopy.isVisible = false;
        return prevValCopy;
      });
    }
    else{
      setNewLandmark({coordinates: coordinates, isVisible: true});
    }
  }

 // Use effect hook.
  useEffect(() => {
    getUserLandmarks();
    getUserPaths();
    getSubsolarPoint();
    const interval = setInterval(() => {
      getSubsolarPoint();
    }, 2 * 60000);

    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
    // return () => clearInterval(interval);
  }, []);

  /**
   * Gets the dashboard content.
   */
  const getDashboardContent = () => {
    if(isAuth){
      return (
        <Grid container spacing={0} style={{width: `calc(100% - ${drawerWidth}px)`, marginLeft: drawerWidth}}>
          <Grid item align='center' style={{ padding: "1vh", height:"100vh", flexGrow: 1}}>
            {isLandmarksLoaded && isPathsLoaded && isSubSolarLoaded ? 
              <Globe
              paths={paths} 
              landmarks={landmarks} 
              landmarkHandler={currentLandmarkHandler} 
              size={getMinDimension()*0.98} 
              tempPath={tempPath}
              newLandmark={newLandmark}
              currentLandmark={currentLandmark}
              editLandmark={editLandmark}
              subSolarCoordinates={subSolarCoordinates}
              editPath={editPath}/> : 
              <Skeleton variant="circle" width={"98vh"} height={"98vh"}/>
            }
          </Grid>
          <Grid item xs={4} align="left">
            <Paper elevation={0} square className={classes.rightPanel}>
              <AppBar position="static">
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth">
                  <Tab style={{ minWidth: 25 }} icon={<InfoIcon/>}/>
                  <Tab style={{ minWidth: 25 }} icon={<MoreHorizIcon/>}/>
                </Tabs>
              </AppBar>
              <LandmarkInfo currentLandmark={currentLandmark} 
                value={tabValue} 
                index={0}/>
              <OtherFeatureTab value={tabValue} 
                index={1} 
                drawerValue={drawerValue}
                invalidateAuth={invalidateAuth}
                landmarks={landmarks}
                setPaths={setPaths}
                newPathHandler={newPathHandler}
                setEditLandmark={setEditLandmark} 
                updateLandmarks={updateLandmarks}  
                deleteLandmark={deleteLandmark} 
                toInformationTab={toInformationTab}
                paths={paths}
                setEditPath={setEditPath}
                editPath={editPath}
                deletePath={deletePath}
                createLandmark={createLandmark}
                updateNewLandmark={updateNewLandmark}/>
            </Paper>
          </Grid>
        </Grid>
      );
    }
    else{
      return (<Redirect to={{pathname:'/loggedOut'}}/>);
    }
  };

  return (
    <div className="App" className={classes.root}>
      <Drawer 
        variant="persistent"
        anchor="left"
        open={true} 
        classes={{
          paper: classes.drawerPaper,
        }}>
        <Typography className={classes.toolbar}>
          Wanderlust
        </Typography>
        <Divider/>
        <Typography className={classes.toolbarMenu}>
          Landmark
        </Typography>
        <List>
          {['New Landmark', 'Landmark List'].map((text, index) => (
            <ListItem button key={text} onClick={() => changeDrawerFeatureHandler(index)}>
              <ListItemIcon>{index === 1 ? <ListIcon/> : <AddIcon/>}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider/>
        <Typography className={classes.toolbarMenu}>
          Path
        </Typography>
        <List>
          {['New Path', 'Path List'].map((text, index) => (
            <ListItem button key={text} onClick={() => changeDrawerFeatureHandler(index + 2)}>
              <ListItemIcon>{index === 1 ? <ListIcon/> : <AddIcon/>}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider/>
        <Typography className={classes.toolbarMenu}>
          Account
        </Typography>
        <List>
          {['Preferences', 'Log Out'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index === 1 ? <ExitToAppIcon/> : <PaletteIcon/>}</ListItemIcon>
              <ListItemText primary={text} onClick={() => onAccountMenuClicked(index)}/>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {getDashboardContent()}
    </div>
  );
}

export default Dashboard;
