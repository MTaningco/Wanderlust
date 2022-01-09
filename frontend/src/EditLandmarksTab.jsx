//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography, CircularProgress, Paper, FormControl, InputLabel, TextField, Grid, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions } from '@material-ui/core';
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

function EditLandmarksTab({value, index, invalidateAuth, updateLandmark, deleteLandmark, landmarks, toInformationTab, updateEditLandmark, setDialogTimer, setLocateLandmarkCoordinates}) {
    
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
  // const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDeleteContent, setDialogDeleteContent] = useState([]);
  const [landmarkUIDToDelete, setLandmarkUIDToDelete] = useState(-1);
  const [indexToDelete, setIndexToDelete] = useState(-1);

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
   * Handles the method upon successful landmark edit.
   * @param {*} res - the response of the http request
   * @param {number} index - the index of the landmark to update on the client side
   */
  const onEditLandmarkSuccessful = (res, index) => {
    setIsEdit(false);
    setIsProcessing(false);
        
    setDialogTitle("Landmark Edit Successful");
    setDialogContent("Your landmark has been edited successfully.");
    setIsDialogOpen(true);

    setTimeout(() => {
      updateLandmark({
        landmark_uid: editId,
        name: editName,
        description: editDescription,
        coordinates: [editLongitude, editLatitude]
      }, index);
      setEditIndex(-1);
    }, 500);
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

      recursiveFetch(body, 1, editIndex, "PUT", onEditLandmarkSuccessful);
    }
    else{
      setDialogTitle("Unable to Edit Landmark");
      setDialogContent("Ensure that the landmark name, longitude, and latitude are populated and valid.");
      setIsDialogOpen(true);
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
   * Handles the operations for a successful landmark deletion.
   * @param {*} res - the response of the http request
   * @param {number} index - the index of the landmark to delete on the client side
   */
  const onDeleteLandmarkSuccessful = (res, index) => {
    setIsProcessing(false);
    setIsEdit(false);
        
    setIsDialogDeleteOpen(false);
    setDialogTitle("Landmark Delete Successful");
    setDialogContent("Your landmark has been deleted successfully.");
    setIsDialogOpen(true);
    setTimeout(() => {
      deleteLandmark(res.landmark_uid, index);
    }, 500);
  }

  /**
   * Fetches for the delete request recursively.
   * @param {*} body - the body to send via http request
   * @param {number} iteration - the iteration number to the base case
   * @param {number} index - the index of the landmark to delete on the client side
   * @param {string} method - the string representing the http request method
   * @param {number} onMethodSuccess - the function to run upon successful http request
   */
  const recursiveFetch = (body, iteration, index, method, onMethodSuccess) => {
    fetch(`/landmarks`, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(res => {
      onMethodSuccess(res, index);
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
          recursiveFetch(body, iteration - 1, index, method, onMethodSuccess);
        })
        .catch((error) => {
          console.log(error);
          invalidateAuth();
        });
      }
    });
  };

  /**
   * Handles deleting the landmark.
   * @param {*} landmark - the landmark to delete
   * @param {number} index - the index of the landmark
   */
  const handleDeleteButtonPressed = (landmark, index) => {
    
    setDialogDeleteContent([`${landmark.name} (${landmark.coordinates[1]}, ${landmark.coordinates[0]})`,`${landmark.description}`]);
    setIsDialogDeleteOpen(true);
    setLandmarkUIDToDelete(landmark.landmark_uid);
    setIndexToDelete(index);
  };

  const handleDeleteLandmark = () => {
    setIsProcessing(true);
    console.log("the landmark uid to delete is", landmarkUIDToDelete);
    const body = {
      landmark_uid: landmarkUIDToDelete
    };

    recursiveFetch(body, 1, indexToDelete, "DELETE", onDeleteLandmarkSuccessful);
  };

  /**
   * Handles closing the dialog.
   */
   const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDialogDeleteClose = () => {
    setIsDialogDeleteOpen(false);
  };

  const handleLocateLandmark = (landmark) => {
    setLocateLandmarkCoordinates(landmark.coordinates);
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
          className={classes.formFields}
          inputProps={{maxLength: 255}}/>
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
          className={classes.formFields}
          inputProps={{maxLength: 500}}/>
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
              <IconButton onClick={() => handleLocateLandmark(element)}>
                <MyLocationIcon/>
              </IconButton>
              <IconButton onClick={() => toInformationTab(element)}>
                <InfoIcon/>
              </IconButton>
              <IconButton color="primary" onClick={() => handleEditLandmarkMode(element, index)}>
                <EditIcon/>
              </IconButton>
              <IconButton color="secondary" onClick={() => handleDeleteButtonPressed(element, index)}>
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
      <Dialog
        open={isDialogDeleteOpen}
        onClose={handleDialogDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth>
          <DialogTitle id="alert-dialog-title">Delete Landmark?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {
                dialogDeleteContent.map(element => {
                  return (
                    <Typography>
                      {element}
                    </Typography>
                  );
                })
              }
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteLandmark}>
              DELETE LANDMARK 
            </Button>
            <Button onClick={handleDialogDeleteClose}>
              CANCEL 
            </Button>
          </DialogActions>
      </Dialog>
    </Paper>
  );
}
 
export default EditLandmarksTab;