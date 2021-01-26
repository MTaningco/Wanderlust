//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

function NewLandmarkTab({setLandmarks, value, index, setTempLandmark, invalidateAuth}) {

  //States
  const [landmarkName, setLandmarkName] = useState("");
  const [landmarkLatitude, setLandmarkLatitude] = useState("");
  const [landmarkLongitude, setLandmarkLongitude] = useState("");
  const [landmarkDescription, setLandmarkDescription] = useState("");

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
      var newTempLandmark = [{
        coordinates: [0, 0],
        isVisible: false
      }];

      setTempLandmark(newTempLandmark);
    }
    if(Math.abs(event.target.value) <= 90){
      setLandmarkLatitude(parseFloat(event.target.value));
      var newTempLandmark = [{
        coordinates: [landmarkLongitude, parseFloat(event.target.value)],
        isVisible: true
      }];
      if(landmarkLongitude !== "" && event.target.value !== ""){
        setTempLandmark(newTempLandmark);
      }
    }
  }

  /**
   * Handles the longitude change.
   * @param {*} event - the text event
   */
  const handleLongitudeChange = (event) => {
    if(event.target.value === ""){
      var newTempLandmark = [{
        coordinates: [0, 0],
        isVisible: false
      }];

      setTempLandmark(newTempLandmark);
    }
    if(Math.abs(event.target.value) <= 180){
      setLandmarkLongitude(parseFloat(event.target.value));

      var newTempLandmark = [{
        coordinates: [parseFloat(event.target.value), landmarkLatitude],
        isVisible: true
      }];

      if(event.target.value !== "" && landmarkLatitude !== ""){
        setTempLandmark(newTempLandmark);
      }
    }
  }

  /**
   * Handles the add landmark event.
   */
  const handleAddLandmark = () => {
    //TODO: allow description to be empty. modify with production
    if(!(landmarkName === "" || landmarkDescription === "" || landmarkLatitude === "" || landmarkLongitude === "")){
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
        setLandmarks(prevArray => [...prevArray, {
          id: `landmark_${res.landmark_uid}`,
          path_uid: res.landmark_uid,
          name: landmarkName,
          description: landmarkDescription,
          coordinates: [parseFloat(landmarkLongitude), parseFloat(landmarkLatitude)]
        }])
  
        setLandmarkName("");
        setLandmarkLatitude("");
        setLandmarkLongitude("");
        setLandmarkDescription("");
        setTempLandmark([{
          coordinates: [0, 0],
          isVisible: false
        }]);
      })
      .catch(err => invalidateAuth());
    }
  };

  return (
    <form hidden={value !== index}>
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
        onChange={handleLatitudeChange} />
      </FormControl>
      <br/>
      <FormControl fullWidth>
      <InputLabel htmlFor="landmarkLongitude">Longitude</InputLabel>
      <Input 
        type="number" 
        id="landmarkLongitude" 
        placeholder="Enter value between -180 to 180" 
        name="Longitude"
        value={landmarkLongitude}
        onChange={handleLongitudeChange} />
      </FormControl>
      <br/>
      <TextField 
        id="standard-basic" 
        label="Landmark Name" 
        placeholder="ie. Vancouver, BC, Canada" 
        value={landmarkName}
        onChange={handleNameChange} 
        fullWidth/>
      <br/>
      <TextField
        id="standard-multiline-static"
        label="Description"
        placeholder="Enter a description about the landmark" 
        multiline
        rows={4}
        value={landmarkDescription}
        onChange={handleDescriptionChange} 
        fullWidth/>
      <br/>
      <br/>
      <Button variant="contained" color="primary" onClick={handleAddLandmark}>
        Add Landmark
      </Button>
    </form>
  );
}
 
export default NewLandmarkTab;