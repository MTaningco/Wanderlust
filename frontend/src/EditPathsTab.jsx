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

function EditPathsTab({value, index, invalidateAuth, paths, deletePath, updatePath, updateEditPath}) {

  //States
  const [isEdit, setIsEdit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editId, setEditId] = useState(-1);
  const [editIndex, setEditIndex] = useState(-1);
  const [coordinates, setCoordinates] = useState([]);
  const [isAirPlane, setIsAirPlane] = useState(false);

  /**
   * Handles a latitude field being changed.
   * @param {*} event - the text event 
   * @param {number} index - the index of the node
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
    updateEditPath(newElements, isAirPlane);
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
    updateEditPath(newElements, isAirPlane);
  };

  /**
   * Handles deleting a node.
   * @param {*} index - the index of the node
   */
  const handleDeleteNode = (index) => {
    var newNodes = [...coordinates];
    newNodes.splice(index, 1);
    setCoordinates(newNodes);
    updateEditPath(newNodes, isAirPlane);
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
    setIsAirPlane(event.target.checked);
    updateEditPath(coordinates, event.target.checked);
  };

  /**
   * Handles editing the landmark.
   */
  const handleEditPath = () => {
    var isNodesPopulated = true;
    for(var i = 0; i < coordinates.length; i++){
      if(coordinates[i][0] === "" || coordinates[i][1] === ""){
        isNodesPopulated = false;
        break;
      }
    }
    if(isNodesPopulated && coordinates.length >= 2){
      setIsProcessing(true);
      const body = {
        path_uid: editId,
        path_name: editName,
        coordinates: coordinates,
        is_airplane: isAirPlane
      };
      
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
          setEditName("");
          setEditId(-1);
          setEditIndex(-1);
          updatePath({
            coordinates: coordinates,
            isAirPlane: isAirPlane,
            path_name: editName
          }, editIndex);
        }, 500);
      })
      .catch((error) => {
        console.log(error);
        invalidateAuth();
      });
    }
    else{
      alert('A field is missing! Cannot update landmark.')
    }
  };

  /**
   * Handles canceling out of the edit mode.
   */
  const handleCancelEdit = () => {
    setIsEdit(false);
    setEditId(-1);
    setEditIndex(-1);
    updateEditPath([], isAirPlane);
  };

  /**
   * Handles creating a new node.
   */
  const handleNewNode = () => {
    setCoordinates(prevVal => [...prevVal, ["", ""]]);
  }

  /**
   * Handles changing the mode to edit.
   * @param {*} path - the path to edit
   * @param {number} index - the index of the path
   */
  const handleEditPathMode = (path, index) => {
    if(isProcessing){
      return;
    }
    setIsEdit(true);
    setEditName(path.path_name);
    setEditId(path.path_uid);
    setEditIndex(index);
    setCoordinates(path.coordinates);
    setIsAirPlane(path.isAirPlane);
    updateEditPath(path.coordinates, path.isAirPlane);
  };

  /**
   * Handles deleting the landmark.
   * @param {*} path - the path to delete
   * @param {number} index - the index of the path
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
      .catch((error) => {
        console.log(error);
        invalidateAuth();
      });
    }
  };

  /**
   * Gets the edit path content.
   */
  const getEditPathContent = () => {
    // console.log(paths);
    return (
      <form>
        <FormControlLabel
          control={
            <Switch 
              checked={isAirPlane} 
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
          coordinates.map((element, index) => {
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
                <Button variant="contained" color="secondary" onClick={() => handleDeleteNode(index)} fullWidth id={deleteBtnId}>
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
              <IconButton color="primary" onClick={() => handleEditPathMode(element, index)}>
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