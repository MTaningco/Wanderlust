//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography, CircularProgress, Paper, FormControl, InputLabel, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import CommuteIcon from '@material-ui/icons/Commute';

function EditPathsTab({value, index, invalidateAuth, setEditPath, updateLandmarks, paths, editPath, deletePath, setPaths}) {

  //States
  const [isEdit, setIsEdit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editName, setEditName] = useState("");

  /**
   * Handles a latitude field being changed.
   * @param {*} event - the text event 
   */
  const onElementLatitudeChange = (event, index) => {
    setEditPath(prevValue => {
      var currentEditPathCopy = {...prevValue};
      var coordinatesCopy = [...currentEditPathCopy.coordinates];
      var coordinateCopy = [...coordinatesCopy[index]];
      if(Math.abs(parseFloat(event.target.value)) <= 90){
        coordinateCopy[1] = parseFloat(event.target.value);
      }
      else if(event.target.value === ""){
        coordinateCopy[1] = "";
      }
      coordinatesCopy[index] = coordinateCopy;
      currentEditPathCopy.coordinates = coordinatesCopy;
      return currentEditPathCopy;
    });
  };

  /**
   * Handles a longitude field being changed.
   * @param {*} event - the text event
   */
  const onElementLongitudeChange = (event, index) => {
    setEditPath(prevValue => {
      var currentEditPathCopy = {...prevValue};
      var coordinatesCopy = [...currentEditPathCopy.coordinates];
      var coordinateCopy = [...coordinatesCopy[index]];
      if(Math.abs(parseFloat(event.target.value)) <= 180){
        coordinateCopy[0] = parseFloat(event.target.value);
      }
      else if(event.target.value === ""){
        coordinateCopy[0] = "";
      }
      coordinatesCopy[index] = coordinateCopy;
      currentEditPathCopy.coordinates = coordinatesCopy;
      return currentEditPathCopy;
    });
  };

  /**
   * Handles deleting a node.
   * @param {*} event - the button event
   */
  const handleDeleteNode = (event, index) => {
    setEditPath(prevValue => {
      var currentEditPathCopy = {...prevValue};
      var coordinatesCopy = [...currentEditPathCopy.coordinates];
      coordinatesCopy.splice(index, 1);
      currentEditPathCopy.coordinates = coordinatesCopy;
      return currentEditPathCopy;
    });
  };

  /**
   * Handles the name change of the edited landmark.
   * @param {*} event - the event for the name change
   */
  const handleNameChange = (event) => {
    setEditName(event.target.value);
  }

  /**
   * Handles the switch state being changed.
   * @param {*} event - the switch event
   */
  const handleSwitchChange = (event) => {
    setEditPath(prevValue => {
      var prevValueCopy = {...prevValue};
      prevValueCopy.isAirPlane = event.target.checked;
      return prevValueCopy;
    });
  };

  /**
   * Returns the sort order that paths should be.
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
    else if(a["path_name"] > b["path_name"]){
      return 1;
    }
    else if(a["path_name"] < b["path_name"]){
      return -1;
    }
    return 0;  
  }

  /**
   * Handles editing the landmark.
   */
  const handleEditPath = () => {
    var isNodesPopulated = true;
    for(var i = 0; i < editPath.coordinates.length; i++){
      if(editPath.coordinates[0] === "" || editPath.coordinates[1] === ""){
        isNodesPopulated = false;
        break;
      }
    }
    if(isNodesPopulated && editPath.coordinates.length >= 2){
      // console.log("original paths", paths);
      var index = -1;
      for(var i = 0; i < paths.length; i++){
        if(paths[i].path_uid === editPath.path_uid){
          index = i;
          break;
        }
      }
      
      setIsProcessing(true);
      const body = {
        path_uid: editPath.path_uid,
        path_name: editName,
        coordinates: editPath.coordinates,
        is_airplane: editPath.isAirPlane
      };
      // console.log("this is the body to edit", body);
      fetch(`/paths`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json())
      .then(res => {
        setIsEdit(false);
        setIsProcessing(false);
        setTimeout(() => {
          setPaths(prevArray => {
            console.log("original editpath", editPath);
            var prevArrayCopy = [...prevArray];
            var pathCopy = {...prevArrayCopy[index]};
            console.log("pre pathCopy", pathCopy);
            pathCopy.isAirPlane = editPath.isAirPlane;
            pathCopy.path_name = editName;
            pathCopy.coordinates = editPath.coordinates;
            console.log("post pathcopy", pathCopy);
            prevArrayCopy[index] = pathCopy;
            prevArrayCopy.sort(sortPaths);
            console.log("array to return", prevArrayCopy);
            return prevArrayCopy;
          });
          setEditName("");
          setEditPath(prevValue => {
            var prevValueCopy = {...prevValue};
            prevValueCopy.coordinates = [];
            return prevValueCopy;
          });
        }, 500);
      })
      .catch(err => invalidateAuth());
    }
    else{
      alert('A field is missing! Cannot update landmark.')
    }
  };

  /**
   * Handles canceling out of the edit mode.
   */
  const handleCancelEdit = (path) => {
    var editPath = [{
      type: "LineString",
      coordinates: [],
      isAirPlane: false
    }];
    setEditPath(editPath);
    setIsEdit(false);
  };

  /**
   * Handles creating a new node.
   */
  const handleNewNode = () => {
    setEditPath(prevValue => {
      var prevValCopy = {...prevValue};
      var coordinatesCopy = [...prevValCopy.coordinates, ["",""]];
      prevValCopy.coordinates = coordinatesCopy;
      return prevValCopy;
    });
  }

  /**
   * Handles changing the mode to edit.
   * @param {*} path - the path to edit
   */
  const handleEditPathMode = (path) => {
    if(isProcessing){
      return;
    }
    setIsEdit(true);
    setEditPath(path);
    setEditName(path.path_name);
  };

  /**
   * Handles deleting the landmark.
   */
  const handleDeletePath = (path, index) => {
    if(isProcessing){
      return;
    }

    let isConfirmed = window.confirm(`Are you sure you want to delete this path?\n\nname:\n${path.path_name === null ? "None" : path.path_name}\ncoordinates:\n${path.coordinates.map((element, index) => {
      return `${index + 1}. (${element[0]}, ${element[1]})\n`;
    }).join("")}`);
    if(isConfirmed){
      setIsProcessing(true);
      
      const body = {
        path_uid: path.path_uid
      };
      fetch(`/paths`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        setIsProcessing(false);
        setIsEdit(false);
        setTimeout(() => {
          deletePath(index);
        }, 500);
      })
      .catch(err => invalidateAuth());
    }
  };

  /**
   * Gets the edit path content.
   */
  const getEditPathContent = () => {
    console.log(paths);
    return (
      <form>
        <FormControlLabel
          control={
            <Switch 
              checked={editPath.isAirPlane} 
              onChange={handleSwitchChange} 
              name="checkedA" 
              checkedIcon={<AirplanemodeActiveIcon/>}
              icon={<CommuteIcon/>}
            />
          }
          label="Travel Type"/>
        <TextField 
            id="standard-basic" 
            label="Path Name" 
            placeholder="e.g. LAX - HKG or California Trip 1" 
            value={editName}
            onChange={handleNameChange}
            fullWidth/>
        {
          editPath.coordinates.map((element, index) => {
            var latId = `nodeLatitude1_${index}`;
            var longitudeId = `nodeLongitude_${index}`;
            var deleteBtnId = `deleteBtn_${index}`;
            return (
              <Paper style={{marginTop: "10px", marginBottom: "10px", padding:"10px"}}  elevation={2}>
                <Typography>Node {index + 1}</Typography>
                <FormControl fullWidth>
                  <InputLabel htmlFor={latId}>Latitude</InputLabel>
                  <Input 
                    type="number" 
                    id={latId}
                    placeholder="Enter value between -90 to 90" 
                    name="Latitude"
                    value={element[1]}
                    onChange={(event) => onElementLatitudeChange(event, index)} />
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel htmlFor={longitudeId}>Longitude</InputLabel>
                  <Input 
                    type="number" 
                    id={longitudeId}
                    placeholder="Enter value between -180 to 180" 
                    name="Longitude"
                    value={element[0]}
                    onChange={(event) => onElementLongitudeChange(event, index)} />
                </FormControl>
                <Button variant="contained" color="secondary" onClick={(event) => handleDeleteNode(event, index)} fullWidth id={deleteBtnId}>
                  Delete Node {index + 1}
                </Button>
              </Paper>
            );
          })
        }

        <Button variant="contained" color="primary" onClick={handleNewNode} fullWidth> 
          Add Node
        </Button>

        <Button variant="contained" color="primary" onClick={handleEditPath}>
            {isProcessing && <CircularProgress size={24} color='secondary' disableShrink />}
            {!isProcessing && 'Finish Edit'}
        </Button>
        
        <Button variant="contained" color="secondary" onClick={handleCancelEdit}>
            {isProcessing && <CircularProgress size={24} color='primary' disableShrink />}
            {!isProcessing && 'Cancel Edit'}
        </Button>
    </form>
    );
  }

  return (
    <Paper hidden={value !== index} square style={{padding: "20px", maxHeight: "calc(100vh - 50px)", overflow: 'auto'}} elevation={0}>
      <Typography variant="h5">
        {isEdit ? "Edit Path" : "Path List"}
      </Typography>
      {
        !isEdit && paths.map((element, index) => {
          return(
            <Paper style={{marginTop: "10px", marginBottom: "10px", padding:"10px"}}  elevation={2}>
              <IconButton>
                {isProcessing ? <CircularProgress style={{color: "white"}}size={24} color='secondary' disableShrink /> : <MyLocationIcon />}
              </IconButton>
              <IconButton color="primary" onClick={() => handleEditPathMode(element)}>
                {isProcessing ? <CircularProgress size={24} color='primary' disableShrink /> : <EditIcon />}
              </IconButton>
              <IconButton color="secondary" onClick={() => handleDeletePath(element, index)}>
                {isProcessing ? <CircularProgress size={24} color='secondary' disableShrink /> : <DeleteIcon />}
              </IconButton>
              <Typography variant="h6">
                {element.isAirPlane ? <AirplanemodeActiveIcon/> : <CommuteIcon/>} 
                {element.path_name === null ? "Unnamed path" : element.path_name}
              </Typography>
            </Paper>
          );
        })
      }
      {
        isEdit && getEditPathContent()
      }
    </Paper>
  );
}
 
export default EditPathsTab;