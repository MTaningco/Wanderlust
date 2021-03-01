//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography, CircularProgress, Grid } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles, useTheme } from '@material-ui/core/styles';

/**
 * Styles used for the component.
 * @param  {*} theme - the theme of the application
 */
const useStyles = makeStyles((theme) => ({
  cancelButton: {
    marginLeft: "10px", 
  },
  finishEditButton: {
    marginRight: "10px", 
  },
  addNode: {
    marginBottom: "40px"
  },
  formFields: {
    marginBottom: "20px"
  }
}));

function NewLandmarkTab({value, index, invalidateAuth, createLandmark, updateNewLandmark}) {
    
  const classes = useStyles();

  //States
  const [landmarkName, setLandmarkName] = useState("");
  const [landmarkLatitude, setLandmarkLatitude] = useState("");
  const [landmarkLongitude, setLandmarkLongitude] = useState("");
  const [landmarkDescription, setLandmarkDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handles the description change
   * @param {*} event - the text event 
   */
  const handleDescriptionChange = (event) => {
    setLandmarkDescription(event.target.value);
  };

  /**
   * Handles the name change.
   * @param {*} event - the text event
   */
  const handleNameChange = (event) => {
    setLandmarkName(event.target.value);
  }

  /**
   * Handles the latitude change.
   * @param {*} event - the text event
   */
  const handleLatitudeChange = (event) => {
    if(event.target.value === ""){
      updateNewLandmark(false, null);
    }
    if(Math.abs(event.target.value) <= 90){
      setLandmarkLatitude(parseFloat(event.target.value));

      if(landmarkLongitude !== "" && event.target.value !== ""){
        updateNewLandmark(true, [landmarkLongitude, parseFloat(event.target.value)]);
      }
    }
  }

  /**
   * Handles the longitude change.
   * @param {*} event - the text event
   */
  const handleLongitudeChange = (event) => {
    if(event.target.value === ""){
      updateNewLandmark(false, null);
    }
    if(Math.abs(event.target.value) <= 180){
      setLandmarkLongitude(parseFloat(event.target.value));

      if(event.target.value !== "" && landmarkLatitude !== ""){
        updateNewLandmark(true, [parseFloat(event.target.value), landmarkLatitude]);
      }
    }
  }

  /**
   * Handles the add landmark event.
   */
  const handleAddLandmark = () => {
    if(!(landmarkName === "" || landmarkLatitude === "" || landmarkLongitude === "")){
      setIsProcessing(true);
      const body = {
        landmarkName: landmarkName,
        landmarkDescription: landmarkDescription,
        latitude: parseFloat(landmarkLatitude),
        longitude: parseFloat(landmarkLongitude)
      }
  
      fetch(`/landmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json())
      .then(res => {
        setLandmarkName("");
        setLandmarkLatitude("");
        setLandmarkLongitude("");
        setLandmarkDescription("");
        setTimeout(() => {
          setIsProcessing(false);
          createLandmark({
            id: `landmark_${res.landmark_uid}`,
            path_uid: res.landmark_uid,
            name: landmarkName,
            description: landmarkDescription,
            coordinates: [parseFloat(landmarkLongitude), parseFloat(landmarkLatitude)]
          });
        }, 500);
      })
      .catch((error) => {
        console.log(error);
        invalidateAuth();
      });//TODO: check if processing needs to be set to false here
    }
  };

  const handleReset = () => {
    setLandmarkName("");
    setLandmarkDescription("");
    setLandmarkLongitude("");
    setLandmarkLatitude("")
  };

  return (
    <form hidden={value !== index} style={{margin: "20px"}}>
      <Typography variant="h5">
        Create a New Landmark
      </Typography>
      <FormControl fullWidth>
        <InputLabel htmlFor="landmarkLatitude">Latitude</InputLabel>
        <Input 
          type="number" 
          id="landmarkLatitude" 
          placeholder="Enter value between -90 to 90" 
          name="Latitude"
          value={landmarkLatitude}
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
          value={landmarkLongitude}
          onChange={handleLongitudeChange}/>
      </FormControl>
      <TextField 
        id="landmarkName" 
        label="Landmark Name" 
        placeholder="e.g. Vancouver, BC, Canada" 
        value={landmarkName}
        onChange={handleNameChange} 
        fullWidth
        className={classes.formFields}/>
      <TextField
        id="standard-multiline-static"
        label="Description"
        placeholder="Enter a description about the landmark" 
        multiline
        rows={12}
        value={landmarkDescription}
        onChange={handleDescriptionChange} 
        fullWidth
        className={classes.formFields}/>
      <Grid container justify="center">
        <Button variant="contained" color="primary" onClick={handleAddLandmark} className={classes.finishEditButton}>
          {isProcessing && <CircularProgress size={24} color='secondary' disableShrink />}
          {!isProcessing && 'Create Landmark'}
        </Button>
        <Button variant="outlined" onClick={handleReset} className={classes.cancelButton}>
          {isProcessing && <CircularProgress size={24} color='primary' disableShrink />}
          {!isProcessing && 'Reset Values'}
        </Button>
      </Grid>
    </form>
  );
}
 
export default NewLandmarkTab;