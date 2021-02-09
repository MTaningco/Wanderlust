//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography, CircularProgress, Paper, FormControl, InputLabel, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MyLocationIcon from '@material-ui/icons/MyLocation';
// import InfoIcon from '@material-ui/icons/Info';
import VisibilityIcon from '@material-ui/icons/Visibility';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import CommuteIcon from '@material-ui/icons/Commute';

function EditPathsTab({value, index, invalidateAuth, setEditPath, updateLandmarks, paths, editPath}) {

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
   * Handles editing the landmark.
   */
  const handleEditLandmark = () => {
    // if(editId !== -1 && editName !== "" && editLongitude !== "" && editLatitude !== ""){
    //   setIsProcessing(true);
    //   const body = {
    //     landmark_uid: editId,
    //     name: editName,
    //     description: editDescription,
    //     coordinates: [editLongitude, editLatitude]
    //   };

    //   fetch(`/landmarks`, {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json",
    //       'authorization' : `Bearer ${localStorage.getItem('token')}`
    //     },
    //     body: JSON.stringify(body)
    //   })
    //   .then(res => res.json())
    //   .then(res => {
    //     setIsEdit(false);
    //     setIsProcessing(false);
    //     setTimeout(() => {
    //       updateLandmarks({
    //         landmark_uid: editId,
    //         name: editName,
    //         description: editDescription,
    //         coordinates: [editLongitude, editLatitude]
    //       })
    //     }, 500);
    //   })
    //   .catch(err => invalidateAuth());
    // }
    // else{
    //   alert('A field is missing! Cannot update landmark.')
    // }
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


  const handleEditPathMode = (path) => {
    setIsEdit(true);
    setEditPath(path);
    setEditName(path.path_name);
  };

  /**
   * Handles deleting the landmark.
   */
  const handleDeletePath = (landmark) => {
    // let isConfirmed = window.confirm(`Are you sure you want to delete this landmark?\n\n${landmark.name}\nlongitude:${landmark.coordinates[0]}\nlatitude:${landmark.coordinates[1]}\n\n${landmark.description}`);
    // if(isConfirmed){
    //   setIsProcessing(true);
    //   const body = {
    //     landmark_uid: landmark.landmark_uid
    //   };
    //   fetch(`/landmarks`, {
    //     method: "DELETE",
    //     headers: {
    //       "Content-Type": "application/json",
    //       'authorization' : `Bearer ${localStorage.getItem('token')}`
    //     },
    //     body: JSON.stringify(body)
    //   })
    //   .then(res => res.json())
    //   .then(res => {
    //     setIsProcessing(false);
    //     // deleteLandmark(currentLandmark[0].landmark_uid);
    //     setIsEdit(false);
    //     setTimeout(() => {
    //       deleteLandmark(landmark.landmark_uid);
    //     }, 500);
    //   })
    //   .catch(err => invalidateAuth());
    // }
  };

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
            placeholder="Vancouver, BC, Canada to New York City, NY, USA" 
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
                <VisibilityIcon/>
              </IconButton>
              <IconButton color="primary" onClick={() => handleEditPathMode(element)}>
                <EditIcon/>
              </IconButton>
              <IconButton color="secondary" onClick={() => handleDeletePath(element)}>
                <DeleteIcon />
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