//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

const REACT_APP_BACKEND = process.env.REACT_APP_BACKEND || '';

function LandmarkInfo({setLandmarks, value, index, userID, setTempLandmark}) {

  //NewLandmarkTab states
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

    var newTempLandmark = [{
      name: landmarkName,
      description: event.target.value,
      coordinates: [landmarkLongitude, landmarkLatitude],
      isVisible: true
    }];

    if(landmarkLongitude !== "" && landmarkLatitude !== ""){
      setTempLandmark(newTempLandmark);
    }
  };

  /**
   * Handles the name change.
   * @param {*} event - the text event
   */
  const handleNameChange = (event) => {
    setLandmarkName(event.target.value);

    var newTempLandmark = [{
      name: event.target.value,
      description: landmarkDescription,
      coordinates: [landmarkLongitude, landmarkLatitude],
      isVisible: true
    }];
    
    if(landmarkLongitude !== "" && landmarkLatitude !== ""){
      setTempLandmark(newTempLandmark);
    }
  }

  /**
   * Handles the latitude change.
   * @param {*} event - the text event
   */
  const handleLatitudeChange = (event) => {
    var latitudeInput = parseFloat(event.target.value);
    
    //TODO: validation check
    if(event.target.value === ""){
      var newTempLandmark = [{
        name: landmarkName,
        description: landmarkDescription,
        coordinates: [0, 0],
        isVisible: false
      }];

      setTempLandmark(newTempLandmark);
    }
    if(Math.abs(event.target.value) <= 90){
      setLandmarkLatitude(event.target.value);
      var newTempLandmark = [{
        name: landmarkName,
        description: landmarkDescription,
        coordinates: [landmarkLongitude, event.target.value],
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
    var longitudeInput = parseFloat(event.target.value);
    //TODO: validation check
    if(event.target.value === ""){
      var newTempLandmark = [{
        name: landmarkName,
        description: landmarkDescription,
        coordinates: [0, 0],
        isVisible: false
      }];

      setTempLandmark(newTempLandmark);
    }
    if(Math.abs(event.target.value) <= 180){
      setLandmarkLongitude(event.target.value);

      var newTempLandmark = [{
        name: landmarkName,
        description: landmarkDescription,
        coordinates: [event.target.value, landmarkLatitude],
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
    //TODO: do validation

    const body = {
      userUID: userID,
      landmarkName: landmarkName,
      landmarkDescription: landmarkDescription,
      latitude: parseFloat(landmarkLatitude),
      longitude: parseFloat(landmarkLongitude)
    }

    fetch(`${REACT_APP_BACKEND}/landmarks`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
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
    });

    setLandmarkName("");
    setLandmarkLatitude("");
    setLandmarkLongitude("");
    setLandmarkDescription("");
    setTempLandmark([{
      name: "",
      description: "",
      coordinates: [0, 0],
      isVisible: false
    }]);
  };

  return (
    <form hidden={value !== index}>
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
      <Button variant="contained" color="primary" onClick={handleAddLandmark}>
        Add Landmark
      </Button>
    </form>
  );
}
 
export default LandmarkInfo;