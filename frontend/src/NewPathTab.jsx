//Imports from libraries
import React, { useState } from "react";
import Typography from '@material-ui/core/Typography';
import { Input } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import CommuteIcon from '@material-ui/icons/Commute';
function NewPathTab({setPaths, value, index, setTempPath}) {

  //NewPathTab states
  const [nodes, setNodes] = useState([]);
  const [isAirplane, setIsAirplane] = useState(true);

  /**
   * Handles creating a new node.
   */
  const handleNewNode = () => {
    setNodes(prevArray => [...prevArray, ["", ""]]);
  }

  /**
   * Handles creating a new path.
   */
  const handleNewPath = () => {
    //TODO: validation

    const body = {
      coordinates: [...nodes], 
      isAirPlane: isAirplane
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
      let newPath = {
        type: "LineString", 
        coordinates: [...nodes], 
        id:`path_${res.path_uid}`,
        path_uid: res.path_uid,
        isAirPlane: isAirplane
      };

      setPaths(prevArray => [...prevArray, newPath]);
    });

    
    setNodes([]);
    setTempPath([{
      type: "LineString",
      coordinates: [],
      isAirPlane: isAirplane
    }]);
  };

  /**
   * Handles deleting a node.
   * @param {*} event - the button event
   */
  const handleDeleteNode = (event) => {
    var idArray = event.target.parentElement.id.split("_");
    var index = parseInt(idArray[1]);

    var newNodes = [...nodes];
    newNodes.splice(index, 1);

    setNodes(newNodes);
    updateTempPath(newNodes);
  };

  /**
   * Updates the temporary path.
   * @param {*} newElements - the nodes used to show the temporary path
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

      if(lat !== "" && long !== ""){
        newTempPath.coordinates.push(node);
      }
    }
    setTempPath([newTempPath]);
  };

  /**
   * Handles a latitude field being changed.
   * @param {*} event - the text event 
   */
  const onElementLatitudeChange = (event) => {
    var idArray = event.target.id.split("_");
    var index = parseInt(idArray[1]);

    var newElements = [...nodes];
    let item = {...newElements[index]};

    if(Math.abs(parseFloat(event.target.value)) <= 90){
      item[1] = parseFloat(event.target.value);
    }
    else if(event.target.value === ""){
      item[1] = event.target.value;
    }

    newElements[index] = item;

    setNodes(newElements);
    updateTempPath(newElements);
  };

  /**
   * Handles a longitude field being changed.
   * @param {*} event - the text event
   */
  const onElementLongitudeChange = (event) => {
    var idArray = event.target.id.split("_");
    var index = parseInt(idArray[1]);

    var newElements = [...nodes];
    let item = {...newElements[index]};

    if(Math.abs(parseFloat(event.target.value)) <= 180){
      item[0] = parseFloat(event.target.value);
    }
    else if(event.target.value === ""){
      item[0] = event.target.value;
    }

    newElements[index] = item;
    
    setNodes(newElements);
    updateTempPath(newElements);
  };

  /**
   * Gets the view for the finish button.
   */
  const getFinishButton = () => {
    if(nodes.length >= 2){
      return(
        <Button variant="contained" color="secondary" onClick={handleNewPath} fullWidth>
          Finish Path
        </Button>
      );
    }
  };

  /**
   * Handles the switch state being changed.
   * @param {*} event - the switch event
   */
  const handleSwitchChange = (event) => {
    setIsAirplane(event.target.checked);
    updateTempPath(nodes, event.target.checked);
  };

  return (
    <form hidden={value !== index}>
      <FormControlLabel
        control={
          <Switch 
            checked={isAirplane} 
            onChange={handleSwitchChange} 
            name="checkedA" 
            checkedIcon={<AirplanemodeActiveIcon/>}
            icon={<CommuteIcon/>}
          />
        }
        label="Travel Type"/>
      {
        nodes.map((element, index) => {
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
                  onChange={onElementLatitudeChange} />
              </FormControl>
              <FormControl fullWidth>
              <InputLabel htmlFor={longitudeId}>Longitude</InputLabel>
              <Input 
                type="number" 
                id={longitudeId}
                placeholder="Enter value between -180 to 180" 
                name="Longitude"
                value={element[0]}
                onChange={onElementLongitudeChange} />
              </FormControl>
              <Button variant="contained" color="secondary" onClick={handleDeleteNode} fullWidth id={deleteBtnId}>
                Delete Node {index + 1}
              </Button>
            </form>
          );
        })
      }
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