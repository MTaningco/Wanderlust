import './App.css';
import Globe from './Globe';
import React, { Component, useState, useRef, useEffect } from "react";
import { Box, Button, Divider, Drawer, Grid, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Paper, Toolbar, Typography, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions } from '@material-ui/core';
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
  const timerRef = useRef(null);
  const autoLogoutRef = useRef(null);
  //States
  const [tabValue, setTabValue] = useState(0);

  const [isAuth, setIsAuth] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInactivityDialogOpen, setIsInactivityDialogOpen] = useState(false);
  // const [dialogTitle, setDialogTitle] = useState("");
  // const [dialogContent, setDialogContent] = useState("");
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
  const [newPath, setNewPath] = useState({
    type: "LineString", 
    coordinates: [],
    isAirPlane: true
  });
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
  async function getUserPaths(){
    try{
      var pathsResponse = await fetch(`/paths`)
      .then(res => res.json())
      .then(res => {
        res.sort(sortPaths);
        setPaths(res);
        setIsPathsLoaded(true);
      });
    }
    catch(e){
      console.log(e);
      invalidateAuth();
    }
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
   * Gets the expiry of a refresh token and sets a timer.
   */
  async function getRefeshTokenExpiry(){
    try{
      var response = await fetch("/users/refreshTokenExpiry").then(res => res.json());
      setDialogTimer(response.refreshTokenExpiry);
    }
    catch(e){
      console.log(e)
      invalidateAuth();
    }
  }

  /**
   * Gets the user's landmarks from the database.
   */
  async function getUserLandmarks(){
    try{
      var landmarksResponse = await fetch('/landmarks')
      .then(res => res.json())
      .then(res => {
        res.sort(sortLandmarks);
        setLandmarks(res);
        setIsLandmarksLoaded(true);
      });
    }
    catch(e){
      try{
        var refreshTokenResponse = await fetch(`/users/refreshToken`, {
          method: "POST"
        })
        .then(res => res.json());

        setDialogTimer(refreshTokenResponse.refreshTokenExpiry);
        try{
          var landmarksResponse2 = await fetch('/landmarks')
          .then(res => res.json())
          .then(res => {
            res.sort(sortLandmarks);
            setLandmarks(res);
            setIsLandmarksLoaded(true);
          });
        }
        catch(e){
          invalidateAuth();
        }
      }
      catch(e){
        console.log(e)
        invalidateAuth();
      }
    }
  };

  /**
   * Invalidates the authorization of the user.
   */
  const invalidateAuth = () => {
    fetch(`/users/logout`, {
      method: "POST"
    })
    .then(() => {
      setIsAuth(false);
      clearDialogTimer();
    })
    .catch(err => console.log(err))
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
  const updateLandmark = (landmark, index) => {
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
    setEditPath(prevVal => {
      const prevValCopy = {...prevVal};
      prevValCopy.coordinates = [];
      return prevValCopy;
    });
    setPaths(pathsCopy);
  };

  /**
   * Handles clicking the account items.
   * @param {*} index - the index that was selected
   */
  const onAccountMenuClicked = (index) => {
    if(index === 1){
      // console.log("user logged out themselves");
      setIsDialogOpen(true);
      // invalidateAuth();
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

  /**
   * Handles changing the currentLandmark object.
   * @param {boolean} isVisible - the boolean to check if the currentLandmark is visible
   * @param {*} landmark - the landmark properties
   */
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

  /**
   * Creates a new landmark into the landmarks object.
   * @param {*} landmark - the landmark information
   */
  const createLandmark = (landmark) => {
    setNewLandmark(prevVal => {
      const prevValCopy = {...prevVal}
      prevValCopy.isVisible = false;
      return prevValCopy
    });
    setLandmarks(prevArray => {
      var newArray = [...prevArray, landmark];
      return newArray.sort(sortLandmarks);
    });
  }

  /**
   * Updates the new landmark object.
   * @param {*} isVisible - the boolean to check if the new landmark is visible
   * @param {*} coordinates - the coordinates of the new landmark
   */
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

  /**
   * Updates the edit landmark object.
   * @param {*} isVisible - the boolean to check if the edit landmark is visible
   * @param {*} coordinates - the coordinates of the edit landmark
   */
  const updateEditLandmark = (isVisible, coordinates) => {
    if(!isVisible){
      setEditLandmark(prevVal => {
        const prevValCopy = {...prevVal};
        prevValCopy.isVisible = false;
        return prevValCopy;
      });
    }
    else{
      setEditLandmark({coordinates: coordinates, isVisible: true});
    }
  }

  /**
   * Creates a new path into the paths object.
   * @param {*} path - the path properties
   */
  const createPath = (path) => {
    setNewPath(prevVal => {
      const prevValCopy = {...prevVal};
      prevValCopy.coordinates = []
      return prevValCopy;
    });
    setPaths(prevArray => {
      var newArray = [...prevArray, path];
      return newArray.sort(sortPaths);
    });
  }

  /**
   * Updates the new path object.
   * @param {*} path - the path properties
   */
  const updateNewPath = (path) => {
    setNewPath(path);
  }

  /**
   * Updates a path in the paths object.
   * @param {*} path - the path properties
   * @param {*} index - the index of the path object
   */
  const updatePath = (path, index) => {
    setEditPath(prevValue => {
      var prevValueCopy = {...prevValue};
      prevValueCopy.coordinates = [];
      return prevValueCopy;
    });
    setPaths(prevArray => {
      var prevArrayCopy = [...prevArray];
      var pathCopy = {...prevArrayCopy[index]};
      pathCopy.isAirPlane = path.isAirPlane;
      pathCopy.path_name = path.path_name;
      pathCopy.coordinates = path.coordinates;
      prevArrayCopy[index] = pathCopy;
      prevArrayCopy.sort(sortPaths);
      return prevArrayCopy;
    });
  };

  /**
   * Updates the editPath object.
   * @param {*} coordinates - the coordinates of the editPath
   * @param {*} isAirPlane - the boolean to check if the path is an airplane type
   */
  const updateEditPath = (coordinates, isAirPlane) => {
    setEditPath(prevVal => {
      const prevValCopy = {...prevVal};
      prevValCopy.coordinates = coordinates;
      prevValCopy.isAirPlane = isAirPlane;
      return prevValCopy;
    });
  };

  /**
   * Handles closing the dialog.
   */
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  /**
   * Handles closing the inactivity dialog.
   */
  const handleInactivityDialogClose = () => {
    setIsInactivityDialogOpen(false);
    fetch(`/users/refreshToken`, {
      method: "POST"
    })
    .then(res => res.json())
    .then(res => {
      setDialogTimer(res.refreshTokenExpiry);
    })
    .catch((error) => {
      console.log(error);
      invalidateAuth();
    });
  };

  /**
   * Sets the timer for the inactivity dialog.
   * @param {*} time 
   */
  const setDialogTimer = (time) => {
    var currentDate = new Date();
    var refreshDate = new Date(time);
    
    if(timerRef.current) {
      clearTimeout(timerRef.current);
      clearTimeout(autoLogoutRef.current);
    }

    var msToDialog = refreshDate.getTime() - 1000*60*30 - currentDate.getTime();
    var msToAutoLogout = refreshDate.getTime() - currentDate.getTime()

    timerRef.current = setTimeout(() => {
      setIsInactivityDialogOpen(true);
    }, msToDialog);

    autoLogoutRef.current = setTimeout(() => {
      invalidateAuth();
    }, msToAutoLogout);
  }

  /**
   * Clears the timers for the inactivity dialog and the auto logout function.
   */
  const clearDialogTimer = () => {
    if(timerRef.current) {
      clearTimeout(timerRef.current);
      clearTimeout(autoLogoutRef.current);
    }
  }

 // Use effect hook.
  useEffect(() => {
    async function getUserData() {
      await getRefeshTokenExpiry();
      await getUserLandmarks();
      await getUserPaths();
    }
    getUserData();
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
      clearDialogTimer();
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
              newPath={newPath}
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
                toInformationTab={toInformationTab}
                landmarks={landmarks}
                paths={paths}
                deletePath={deletePath}
                createLandmark={createLandmark}
                updateNewLandmark={updateNewLandmark}
                updateLandmark={updateLandmark}  
                deleteLandmark={deleteLandmark} 
                updateEditLandmark={updateEditLandmark}
                updateNewPath={updateNewPath}
                createPath={createPath}
                updatePath={updatePath}
                updateEditPath={updateEditPath}
                setDialogTimer={setDialogTimer}/>
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
      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth>
          <DialogTitle id="alert-dialog-title">Log Out</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to log out of Wanderlust?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={invalidateAuth}>
              YES 
            </Button>
            <Button onClick={handleDialogClose}>
              NO
            </Button>
          </DialogActions>
      </Dialog>
      <Dialog
        open={isInactivityDialogOpen}
        onClose={handleInactivityDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth>
          <DialogTitle id="alert-dialog-title">Long Period of Inactivity</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you still here?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleInactivityDialogClose}>
              YES 
            </Button>
            <Button onClick={invalidateAuth}>
              NO
            </Button>
          </DialogActions>
      </Dialog>
    </div>
  );
}

export default Dashboard;
