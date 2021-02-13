//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography, CircularProgress, Paper, FormControl, InputLabel, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import InfoIcon from '@material-ui/icons/Info';

function EditLandmarksTab({value, index, invalidateAuth, setEditLandmark, updateLandmarks, deleteLandmark, landmarks, toInformationTab}) {

  //States
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLongitude, setEditLongitude] = useState("");
  const [editLatitude, setEditLatitude] = useState("");

  /**
   * Handles the latitude change of the edited landmark.
   * @param {*} event - the event for the latitude change
   */
  const handleLatitudeChange = (event) => {
    if(event.target.value === ""){
      var editLandmark = [{
        coordinates: [0, 0],
        isVisible: false
      }];
      setEditLandmark(editLandmark);
    }

    if(Math.abs(event.target.value) <= 90){
      setEditLatitude(event.target.value);
      var editLandmark = [{
        coordinates: [editLongitude, parseFloat(event.target.value)],
        isVisible: true
      }];
      if(editLongitude !== "" && event.target.value !== ""){
        setEditLandmark(editLandmark);
      }
    }
  }

  /**
   * Handles the longitude change of the edited landmark.
   * @param {*} event - the event for the longitude change
   */
  const handleLongitudeChange = (event) => {
    if(event.target.value === ""){
      var editLandmark = [{
        coordinates: [0, 0],
        isVisible: false
      }];
      setEditLandmark(editLandmark);
    }

    if(Math.abs(event.target.value) <= 180){
      setEditLongitude(event.target.value);
      var editLandmark = [{
        coordinates: [parseFloat(event.target.value), editLatitude],
        isVisible: true
      }];
      if(editLatitude !== "" && event.target.value !== ""){
        setEditLandmark(editLandmark);
      }
    }
  }

  /**
   * Handles the name change of the edited landmark.
   * @param {*} event - the event for the name change
   */
  const handleNameChange = (event) => {
    setEditName(event.target.value);
  }

  /**
   * Handles the description change of the edited landmark.
   * @param {*} event - the event for the desription change
   */
  const handleDescriptionChange = (event) => {
    setEditDescription(event.target.value);
  }

  /**
   * Handles editing the landmark.
   */
  const handleEditLandmark = () => {
    if(editId !== -1 && editName !== "" && editLongitude !== "" && editLatitude !== ""){
      setIsProcessing(true);
      const body = {
        landmark_uid: editId,
        name: editName,
        description: editDescription,
        coordinates: [editLongitude, editLatitude]
      };

      fetch(`/landmarks`, {
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
          updateLandmarks({
            landmark_uid: editId,
            name: editName,
            description: editDescription,
            coordinates: [editLongitude, editLatitude]
          })
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
  const handleCancelEdit = () => {
    var editLandmark = [{
      coordinates: [0, 0],
      isVisible: false
    }];
    setEditLandmark(editLandmark);
    setIsEdit(false);
  };

  /**
   * Handles changing to the edit landmark mode.
   * @param {*} landmark - the landmark to edit
   */
  const handleEditLandmarkMode = (landmark) => {
    setIsEdit(true);
    setEditId(landmark.landmark_uid);
    setEditName(landmark.name);
    setEditDescription(landmark.description);
    setEditLongitude(landmark.coordinates[0]);
    setEditLatitude(landmark.coordinates[1]);
    var editLandmark = [{
        coordinates: [landmark.coordinates[0], landmark.coordinates[1]],
        isVisible: true
    }];
    setEditLandmark(editLandmark);
  };

  /**
   * Handles deleting the landmark.
   */
  const handleDeleteLandmark = (landmark) => {
    let isConfirmed = window.confirm(`Are you sure you want to delete this landmark?\n\n${landmark.name}\nlongitude:${landmark.coordinates[0]}\nlatitude:${landmark.coordinates[1]}\n\n${landmark.description}`);
    if(isConfirmed){
      setIsProcessing(true);
      const body = {
        landmark_uid: landmark.landmark_uid
      };
      fetch(`/landmarks`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json())
      .then(res => {
        setIsProcessing(false);
        setIsEdit(false);
        setTimeout(() => {
          deleteLandmark(landmark.landmark_uid);
        }, 500);
      })
      .catch(err => invalidateAuth());
    }
  };

  /**
   * Gets the landmark content.
   */
  const getEditLandmarkContent = () => {
    return (
      <form>
        <FormControl fullWidth>
        <InputLabel htmlFor="landmarkLatitude">Latitude</InputLabel>
        <Input 
            type="number" 
            id="landmarkLatitude" 
            placeholder="Enter value between -90 to 90" 
            name="Latitude"
            value={editLatitude}
            onChange={handleLatitudeChange}/>
        </FormControl>
        <br/>
        <FormControl fullWidth>
        <InputLabel htmlFor="landmarkLongitude">Longitude</InputLabel>
        <Input 
            type="number" 
            id="landmarkLongitude" 
            placeholder="Enter value between -180 to 180" 
            name="Longitude"
            value={editLongitude}
            onChange={handleLongitudeChange}/>
        </FormControl>
        <br/>
        <TextField 
            id="standard-basic" 
            label="Landmark Name" 
            placeholder="ie. Vancouver, BC, Canada" 
            value={editName}
            onChange={handleNameChange}
            fullWidth/>
        <br/>
        <TextField
            id="standard-multiline-static"
            label="Description"
            placeholder="Enter a description about the landmark" 
            multiline
            rows={12}
            maxHeight="500px"
            value={editDescription}
            onChange={handleDescriptionChange}
            fullWidth/>
        <br/>
        <br/>
        <Button variant="contained" color="primary" onClick={handleEditLandmark}>
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
        {isEdit ? "Edit Landmark" : "Landmark List"}
      </Typography>
      {
        !isEdit && landmarks.map((element, index) => {
          return(
            <Paper style={{marginTop: "10px", marginBottom: "10px", padding:"10px"}}  elevation={2}>
              <IconButton>
                <MyLocationIcon/>
              </IconButton>
              <IconButton onClick={() => toInformationTab(element)}>
                <InfoIcon/>
              </IconButton>
              <IconButton color="primary" onClick={() => handleEditLandmarkMode(element)}>
                <EditIcon/>
              </IconButton>
              <IconButton color="secondary" onClick={() => handleDeleteLandmark(element)}>
                <DeleteIcon />
              </IconButton>
              <Typography variant="h6">
                {element.name}
              </Typography>
            </Paper>
          );
        })
      }
      {
        isEdit && getEditLandmarkContent()
      }
    </Paper>
  );
}
 
export default EditLandmarksTab;