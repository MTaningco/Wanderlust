//Imports from libraries
import React, { useState } from "react";
import Typography from '@material-ui/core/Typography';
import { Input, CircularProgress, Paper, TextField, Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import CommuteIcon from '@material-ui/icons/Commute';
import CoordinateFormItem from "./CoordinateFormItem";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';

/**
 * Styles used for the component.
 * @param  {*} theme - the theme of the application
 */
const useStyles = makeStyles((theme) => ({
  cancelButton: {
    marginLeft: "10px", 
    marginBottom: "50vh",
  },
  finishEditButton: {
    marginRight: "10px", 
    marginBottom: "50vh"
  },
  addNode: {
    marginBottom: "40px"
  },
}));

function NewPathTab({value, index, invalidateAuth, updateNewPath, createPath}) {
    
  const classes = useStyles();

  //NewPathTab states
  const [coordinates, setCoordinates] = useState([]);
  const [isAirplane, setIsAirplane] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");

  /**
   * Handles the name change of the edited landmark.
   * @param {*} event - the event for the name change
   */
  const handleNameChange = (event) => {
    setName(event.target.value);
  }

  /**
   * Handles creating a new node.
   */
  const handleNewNode = () => {
    setCoordinates(prevArray => [...prevArray, ["", ""]]);
  }

  /**
   * Handles creating a new path.
   */
  const handleNewPath = () => {
    var isNodesPopulated = true;

    for(var i = 0; i < coordinates.length; i++){
      if(coordinates[i][0] === "" || coordinates[i][1] === ""){
        isNodesPopulated = false;
      }
    }
    
    if(isNodesPopulated && coordinates.length >= 2){
      setIsProcessing(true);
      const body = {
        coordinates: [...coordinates], 
        isAirPlane: isAirplane,
        path_name: name
      }
  
      fetch(`/paths`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json())
      .then(res => {
        setCoordinates([]);
        setName("");
        setTimeout(() => {
          setIsProcessing(false);
          createPath({
            type: "LineString", 
            coordinates: [...coordinates], 
            id:`path_${res.path_uid}`,
            path_uid: res.path_uid,
            isAirPlane: isAirplane,
            path_name: name
          });
        }, 500);
      })
      .catch((error) => {
        //access token is invalid, try to refresh the access token and try again
        // console.log("access token no longer valid, attempt to get new access token through refresh token");
        fetch(`/users/refreshToken`, {
          method: "POST"
        })
        .then(res => res.json())
        .then(res => {
          // console.log("access token renewed, retrying creating path");
          fetch(`/paths`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          })
          .then(res => res.json())
          .then(res => {
            setCoordinates([]);
            setName("");
            setTimeout(() => {
              setIsProcessing(false);
              createPath({
                type: "LineString", 
                coordinates: [...coordinates], 
                id:`path_${res.path_uid}`,
                path_uid: res.path_uid,
                isAirPlane: isAirplane,
                path_name: name
              });
            }, 500);
          })
          .catch((error) => {
            // console.log("access token still invalid. Invalidating authorization");
            // console.log(error);
            invalidateAuth();
          });
        })
        .catch((error) => {
          // console.log("access token still invalid. Invalidating authorization");
          // console.log(error);
          invalidateAuth();
        });
      });
    }
  };

  /**
   * Handles deleting a node.
   * @param {*} index - the index of the node to delete
   */
  const handleDeleteNode = (index) => {
    var newNodes = [...coordinates];
    newNodes.splice(index, 1);

    setCoordinates(newNodes);
    updateTempPath(newNodes);
  };

  /**
   * Updates the temporary path.
   * @param {*} newElements - the coordinates used to show the temporary path
   * @param {*} newIsAirplane - (optional) the boolean airplane state
   */
  const updateTempPath = (newElements, newIsAirplane) => {
    var isAirplaneVal = newIsAirplane !== undefined ? newIsAirplane : isAirplane;

    var newTempPath = {
      type: "LineString", 
      coordinates: [],
      isAirPlane: isAirplaneVal
    };

    for(var i = 0; i < newElements.length; i++){
      var node = newElements[i];
      var lat = node[1];
      var long = node[0];

      newTempPath.coordinates.push([long !== "" ? long : 0, lat !== "" ? lat : 0])
    }
    updateNewPath(newTempPath);
  };

  /**
   * Handles a latitude field being changed.
   * @param {*} event - the text event 
   * @param {number} index - the index of the latitude to change
   */
  const onElementLatitudeChange = (event, index) => {
    var newElements = [...coordinates];
    let item = {...newElements[index]};

    if(Math.abs(parseFloat(event.target.value)) <= 90){
      item[1] = parseFloat(event.target.value);
    }
    else if(event.target.value === ""){
      item[1] = event.target.value;
    }
    
    newElements[index] = item;

    setCoordinates(newElements);
    updateTempPath(newElements);
  };

  /**
   * Handles a longitude field being changed.
   * @param {*} event - the text event
   * @param {number} index - the index of the node
   */
  const onElementLongitudeChange = (event, index) => {
    var newElements = [...coordinates];
    let item = {...newElements[index]};

    if(Math.abs(parseFloat(event.target.value)) <= 180){
      item[0] = parseFloat(event.target.value);
    }
    else if(event.target.value === ""){
      item[0] = event.target.value;
    }

    newElements[index] = item;
    
    setCoordinates(newElements);
    updateTempPath(newElements);
  };

  /**
   * Handles the switch state being changed.
   * @param {*} event - the switch event
   */
  const handleSwitchChange = (event) => {
    setIsAirplane(event.target.checked);
    updateTempPath(coordinates, event.target.checked);
  };

  const handleReset = () => {
    setName("");
    setCoordinates([]);
    updateTempPath([]);
  };

  return (
    <Paper hidden={value !== index} square style={{padding: "20px", maxHeight: "calc(100vh - 50px)", overflow: 'auto'}} elevation={0}>
      <Typography variant="h5">
        Create a New Path
      </Typography>
      <FormControlLabel
        control={
          <Switch 
            checked={isAirplane} 
            onChange={handleSwitchChange} 
            name="checkedA" 
            checkedIcon={<AirplanemodeActiveIcon/>}
            icon={<CommuteIcon/>}/>
        }
        label="Travel Type"/>
      <TextField 
        id="pathName" 
        label="Path Name" 
        placeholder="e.g. LAX - HKG or California Trip 1" 
        value={name}
        onChange={handleNameChange}
        fullWidth
        style={{marginBottom: "10px"}}/>
        {
          coordinates.map((element, index) => {
            return (
              <CoordinateFormItem
                latitude={element[1]}
                longitude={element[0]}
                onLatitudeChange={onElementLatitudeChange}
                onLongitudeChange={onElementLongitudeChange}
                onDelete={handleDeleteNode}
                index={index}/>
            );
          })
        }
      <Button variant="contained" color="primary" onClick={handleNewNode} fullWidth className={classes.addNode}> 
          <AddIcon className={classes.iconText}/> Add Node
        </Button>
      
        <Grid container justify="center">
          <Button variant="contained" color="primary" onClick={handleNewPath} className={classes.finishEditButton}>
            {isProcessing && <CircularProgress size={24} color='secondary' disableShrink />}
            {!isProcessing && 'Create Path'}
          </Button>
          <Button variant="outlined" onClick={handleReset} className={classes.cancelButton}>
            {isProcessing && <CircularProgress size={24} color='primary' disableShrink />}
            {!isProcessing && 'Reset Values'}
          </Button>
        </Grid>
    </Paper>
  );
}
 
export default NewPathTab;