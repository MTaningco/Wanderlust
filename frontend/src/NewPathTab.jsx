//Imports from libraries
import React, { useState } from "react";
import Typography from '@material-ui/core/Typography';
import { Input, CircularProgress, Paper, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import CommuteIcon from '@material-ui/icons/Commute';

function NewPathTab({value, index, invalidateAuth, updateNewPath, createPath}) {

  //NewPathTab states
  const [coordinates, setCoordinates] = useState([]);
  const [isAirplane, setIsAirplane] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");

  /**
   * Handles the name change of the edited landmark.
   * @param {*} event - the event for the name change
   */
  const handleNameChange = (event) => {
    setName(event.target.value);
  }

  /**
   * Handles creating a new node.
   */
  const handleNewNode = () => {
    setCoordinates(prevArray => [...prevArray, ["", ""]]);
  }

  /**
   * Handles creating a new path.
   */
  const handleNewPath = () => {
    var isNodesPopulated = true;

    for(var i = 0; i < coordinates.length; i++){
      if(coordinates[i][0] === "" || coordinates[i][1] === ""){
        isNodesPopulated = false;
      }
    }
    
    if(isNodesPopulated && coordinates.length >= 2){
      setIsProcessing(true);
      const body = {
        coordinates: [...coordinates], 
        isAirPlane: isAirplane,
        path_name: name
      }
  
      fetch(`/paths`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json())
      .then(res => {
        setCoordinates([]);
        setName("");
        setTimeout(() => {
          setIsProcessing(false);
          createPath({
            type: "LineString", 
            coordinates: [...coordinates], 
            id:`path_${res.path_uid}`,
            path_uid: res.path_uid,
            isAirPlane: isAirplane,
            path_name: name
          });
        }, 500);
      })
      .catch(err => invalidateAuth());
    }
  };

  /**
   * Handles deleting a node.
   * @param {*} index - the index of the node to delete
   */
  const handleDeleteNode = (index) => {
    var newNodes = [...coordinates];
    newNodes.splice(index, 1);

    setCoordinates(newNodes);
    updateTempPath(newNodes);
  };

  /**
   * Updates the temporary path.
   * @param {*} newElements - the coordinates used to show the temporary path
   * @param {*} newIsAirplane - (optional) the boolean airplane state
   */
  const updateTempPath = (newElements, newIsAirplane) => {
    var isAirplaneVal = newIsAirplane !== undefined ? newIsAirplane : isAirplane;

    var newTempPath = {
      type: "LineString", 
      coordinates: [],
      isAirPlane: isAirplaneVal
    };

    for(var i = 0; i < newElements.length; i++){
      var node = newElements[i];
      var lat = node[1];
      var long = node[0];

      newTempPath.coordinates.push([long !== "" ? long : 0, lat !== "" ? lat : 0])
    }
    updateNewPath(newTempPath);
  };

  /**
   * Handles a latitude field being changed.
   * @param {*} event - the text event 
   * @param {number} index - the index of the latitude to change
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
    updateTempPath(newElements);
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
    updateTempPath(newElements);
  };

  /**
   * Handles the switch state being changed.
   * @param {*} event - the switch event
   */
  const handleSwitchChange = (event) => {
    setIsAirplane(event.target.checked);
    updateTempPath(coordinates, event.target.checked);
  };

  /**
   * Gets the view for the finish button.
   */
  const getFinishButton = () => {
    if(coordinates.length >= 2){
      return(
        <Button variant="contained" color="secondary" onClick={handleNewPath} fullWidth>
          {isProcessing && <CircularProgress size={24} color='primary' disableShrink />}
          {!isProcessing && 'Finish Path'}
        </Button>
      );
    }
  };

  return (
    <form hidden={value !== index} style={{margin: "20px"}}>
      <Typography variant="h5">
        Create a New Path
      </Typography>
      <FormControlLabel
        control={
          <Switch 
            checked={isAirplane} 
            onChange={handleSwitchChange} 
            name="checkedA" 
            checkedIcon={<AirplanemodeActiveIcon/>}
            icon={<CommuteIcon/>}/>
        }
        label="Travel Type"/>
      <TextField 
        id="standard-basic" 
        label="Path Name" 
        placeholder="e.g. LAX - HKG or California Trip 1" 
        value={name}
        onChange={handleNameChange}
        fullWidth/>
      <Paper style={{maxHeight: "50vh", overflow: 'auto'}}>
        {
          coordinates.map((element, index) => {
            var latId = `nodeLatitude_${index}`;
            var longitudeId = `nodeLongitude_${index}`;
            var deleteBtnId = `deleteBtn_${index}`;

            return (
              <form>
                <br/>
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
              </form>
            );
          })
        }
      </Paper>
      <br/>
      <Button variant="contained" color="primary" onClick={handleNewNode} fullWidth> 
        Add Node
      </Button>
      
      {getFinishButton()}

      <br/>
    </form>
  );
}
 
export default NewPathTab;