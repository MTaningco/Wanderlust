//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography, CircularProgress, Paper, FormControl, InputLabel, TextField, Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import InfoIcon from '@material-ui/icons/Info';
import { makeStyles, useTheme } from '@material-ui/core/styles';

/**
 * Styles used for the component.
 * @param  {*} theme - the theme of the application
 */
const useStyles = makeStyles((theme) => ({
  nodeElement: {
    position: 'relative',
    marginTop: "10px", 
    marginBottom: "10px", 
    paddingTop: "20px",
    paddingBottom: "20px",
    paddingLeft: "10px",
    paddingRight:"10px",
    backgroundColor: "#525252"
  },
  iconText: {
    marginRight: "10px",
    marginLeft: "10px"
  },
  cancelButton: {
    marginLeft: "10px", 
  },
  finishEditButton: {
    marginRight: "10px", 
  },
  formFields: {
    marginBottom: "20px"
  }
}));

function EditLandmarksTab({value, index, invalidateAuth, updateLandmark, deleteLandmark, landmarks, toInformationTab, updateEditLandmark}) {
    
  const classes = useStyles();

  //States
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLongitude, setEditLongitude] = useState("");
  const [editLatitude, setEditLatitude] = useState("");
  const [editIndex, setEditIndex] = useState(-1);

  /**
   * Handles the latitude change of the edited landmark.
   * @param {*} event - the event for the latitude change
   */
  const handleLatitudeChange = (event) => {
    if(event.target.value === ""){
      updateEditLandmark(false, null);
    }

    if(Math.abs(event.target.value) <= 90){
      setEditLatitude(event.target.value);
      if(editLongitude !== "" && event.target.value !== ""){
        updateEditLandmark(true, [editLongitude, parseFloat(event.target.value)]);
      }
    }
  }

  /**
   * Handles the longitude change of the edited landmark.
   * @param {*} event - the event for the longitude change
   */
  const handleLongitudeChange = (event) => {
    if(event.target.value === ""){
      updateEditLandmark(false, null);
    }

    if(Math.abs(event.target.value) <= 180){
      setEditLongitude(event.target.value);
      if(editLatitude !== "" && event.target.value !== ""){
        updateEditLandmark(true, [parseFloat(event.target.value), editLatitude]);
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
          updateLandmark({
            landmark_uid: editId,
            name: editName,
            description: editDescription,
            coordinates: [editLongitude, editLatitude]
          }, editIndex);
          setEditIndex(-1);
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
    updateEditLandmark(false, null);
    setIsEdit(false);
    setEditIndex(-1);
  };

  /**
   * Handles changing to the edit landmark mode.
   * @param {*} landmark - the landmark to edit
   * @param {number} index - the index of the landmark 
   */
  const handleEditLandmarkMode = (landmark, index) => {
    setIsEdit(true);
    setEditId(landmark.landmark_uid);
    setEditName(landmark.name);
    setEditDescription(landmark.description);
    setEditLongitude(landmark.coordinates[0]);
    setEditLatitude(landmark.coordinates[1]);
    setEditIndex(index);
    updateEditLandmark(true, [landmark.coordinates[0], landmark.coordinates[1]]);
  };

  /**
   * Handles deleting the landmark.
   * @param {*} landmark - the landmark to delete
   * @param {number} index - the index of the landmark
   */
  const handleDeleteLandmark = (landmark, index) => {
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
          deleteLandmark(landmark.landmark_uid, index);
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
        <FormControl fullWidth
          className={classes.formFields}>
          <InputLabel htmlFor="landmarkLongitude">Longitude</InputLabel>
          <Input 
          type="number" 
          id="landmarkLongitude" 
          placeholder="Enter value between -180 to 180" 
          name="Longitude"
          value={editLongitude}
          onChange={handleLongitudeChange}/>
        </FormControl>
        <TextField 
          id="landmarkName" 
          label="Landmark Name" 
          placeholder="e.g. Vancouver, BC, Canada" 
          value={editName}
          onChange={handleNameChange}
          fullWidth
          className={classes.formFields}/>
        <TextField
          id="standard-multiline-static"
          label="Description"
          placeholder="Enter a description about the landmark" 
          multiline
          rows={12}
          maxHeight="500px"
          value={editDescription}
          onChange={handleDescriptionChange}
          fullWidth
          className={classes.formFields}/>
        <Grid container justify="center">
          <Button variant="contained" color="primary" onClick={handleEditLandmark} className={classes.finishEditButton}>
            {isProcessing && <CircularProgress size={24} color='secondary' disableShrink />}
            {!isProcessing && 'Finish Edit'}
          </Button>
          <Button variant="outlined" onClick={handleCancelEdit} className={classes.cancelButton}>
            {isProcessing && <CircularProgress size={24} color='primary' disableShrink />}
            {!isProcessing && 'Cancel Edit'}
          </Button>
        </Grid>
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
            <Paper className={classes.nodeElement} elevation={2} key={element.id}>
              <IconButton>
                <MyLocationIcon/>
              </IconButton>
              <IconButton onClick={() => toInformationTab(element)}>
                <InfoIcon/>
              </IconButton>
              <IconButton color="primary" onClick={() => handleEditLandmarkMode(element, index)}>
                <EditIcon/>
              </IconButton>
              <IconButton color="secondary" onClick={() => handleDeleteLandmark(element, index)}>
                <DeleteIcon />
              </IconButton>
              <Typography variant="h6" className={classes.iconText}>
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