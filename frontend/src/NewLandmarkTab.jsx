//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography, CircularProgress, Grid, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions } from '@material-ui/core';
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

function NewLandmarkTab({value, index, invalidateAuth, createLandmark, updateNewLandmark, setDialogTimer}) {
    
  const classes = useStyles();

  //States
  const [landmarkName, setLandmarkName] = useState("");
  const [landmarkLatitude, setLandmarkLatitude] = useState("");
  const [landmarkLongitude, setLandmarkLongitude] = useState("");
  const [landmarkDescription, setLandmarkDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");

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

  const onLandmarkSuccessful = (res) => {
    setLandmarkName("");
    setLandmarkLatitude("");
    setLandmarkLongitude("");
    setLandmarkDescription("");
        
    setDialogTitle("New Landmark Added");
    setDialogContent("Your landmark has been added successfully.");
    setIsDialogOpen(true);

    setTimeout(() => {
      setIsProcessing(false);
      createLandmark({
        id: `landmark_${res.landmark_uid}`,
        landmark_uid: res.landmark_uid,
        name: landmarkName,
        description: landmarkDescription,
        coordinates: [parseFloat(landmarkLongitude), parseFloat(landmarkLatitude)]
      });
    }, 500);
  };

  const recursiveFetch = (body, iteration) => {
    fetch(`/landmarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(res => {
      onLandmarkSuccessful(res);
    })
    .catch((error) => {
      if(iteration === 0){
        console.log(error);
        invalidateAuth();
      }
      else{
        fetch(`/users/refreshToken`, {
          method: "POST"
        })
        .then(res => res.json())
        .then(res => {
          setDialogTimer(res.refreshTokenExpiry);
          recursiveFetch(body, iteration - 1);
        })
        .catch((error) => {
          console.log(error);
          invalidateAuth();
        });
      }
    });
  };

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

      recursiveFetch(body, 1);
    }
    else{
      setDialogTitle("Unable to Add Landmark");
      setDialogContent("Ensure that the landmark name, longitude, and latitude are populated and valid.");
      setIsDialogOpen(true);
    }
  };

  /**
   * Handles closing the dialog.
   */
   const handleDialogClose = () => {
    setIsDialogOpen(false);
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
        className={classes.formFields}
        inputProps={{maxLength: 255}}/>
      <TextField
        id="standard-multiline-static"
        label="Description"
        placeholder="Enter a description about the landmark" 
        multiline
        rows={12}
        value={landmarkDescription}
        onChange={handleDescriptionChange} 
        fullWidth
        className={classes.formFields}
        inputProps={{maxLength: 500}}/>
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
      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth>
          <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {dialogContent}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>
              OK 
            </Button>
          </DialogActions>
      </Dialog>
    </form>
  );
}
 
export default NewLandmarkTab;