//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography, CircularProgress, Paper, FormControl, InputLabel, TextField, Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import CommuteIcon from '@material-ui/icons/Commute';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CoordinateFormItem from "./CoordinateFormItem";

/**
 * Styles used for the component.
 * @param  {*} theme - the theme of the application
 */
const useStyles = makeStyles((theme) => ({
  root: {
    padding: "20px", 
    maxHeight: "calc(100vh - 50px)", 
    overflow: 'auto'
  },
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
  deleteButton: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    color: "white",
    '&:hover': {
      color: "white",
      backgroundColor: 'gray',
      boxShadow: 'none',
    }
  },
  iconText: {
    marginRight: "10px",
    marginLeft: "10px"
  },
  addNode: {
    marginBottom: "40px"
  },
  cancelButton: {
    marginLeft: "10px", 
    marginBottom: "50vh",
  },
  finishEditButton: {
    marginRight: "10px", 
    marginBottom: "50vh"
  },
  pathTypography : {
    display: 'flex',
    alignItems: 'center'
  },
  '@global': {
    '*::-webkit-scrollbar': {
    width: '10px'
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(35, 39, 42, .7)',
      '-webkit-border-radius': '10px'
    },
    '*::-webkit-scrollbar-thumb': {
      '-webkit-border-radius': '10px',
      'border-radius': '10px',
      'background': '#858585' 
    }
  }
}));

function EditPathsTab({value, index, invalidateAuth, paths, deletePath, updatePath, updateEditPath}) {
    
  const classes = useStyles();

  //States
  const [isEdit, setIsEdit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editId, setEditId] = useState(-1);
  const [editIndex, setEditIndex] = useState(-1);
  const [coordinates, setCoordinates] = useState([]);
  const [isAirPlane, setIsAirPlane] = useState(false);

  /**
   * Handles a latitude field being changed.
   * @param {*} event - the text event 
   * @param {number} index - the index of the node
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
    updateEditPath(newElements, isAirPlane);
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
    updateEditPath(newElements, isAirPlane);
  };

  /**
   * Handles deleting a node.
   * @param {*} index - the index of the node
   */
  const handleDeleteNode = (index) => {
    var newNodes = [...coordinates];
    newNodes.splice(index, 1);
    setCoordinates(newNodes);
    updateEditPath(newNodes, isAirPlane);
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
    setIsAirPlane(event.target.checked);
    updateEditPath(coordinates, event.target.checked);
  };

  /**
   * Handles editing the landmark.
   */
  const handleEditPath = () => {
    var isNodesPopulated = true;
    for(var i = 0; i < coordinates.length; i++){
      if(coordinates[i][0] === "" || coordinates[i][1] === ""){
        isNodesPopulated = false;
        break;
      }
    }
    if(isNodesPopulated && coordinates.length >= 2){
      setIsProcessing(true);
      const body = {
        path_uid: editId,
        path_name: editName,
        coordinates: coordinates,
        is_airplane: isAirPlane
      };
      
      fetch(`/paths`, {
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
          setEditName("");
          setEditId(-1);
          setEditIndex(-1);
          updatePath({
            coordinates: coordinates,
            isAirPlane: isAirPlane,
            path_name: editName
          }, editIndex);
        }, 500);
      })
      .catch((error) => {
        //access token is invalid, try to refresh the access token and try again
        // console.log("access token no longer valid, attempt to get new access token through refresh token");
        fetch(`/users/refreshToken`, {
          method: "POST",
          headers: {
            'authorization' : `Bearer ${localStorage.getItem('refreshToken')}` 
          }
        })
        .then(res => res.json())
        .then(res => {
          localStorage.setItem('token', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          // console.log("access token renewed, retrying editing path");
          fetch(`/paths`, {
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
              setEditName("");
              setEditId(-1);
              setEditIndex(-1);
              updatePath({
                coordinates: coordinates,
                isAirPlane: isAirPlane,
                path_name: editName
              }, editIndex);
            }, 500);
          })
          .catch((error) => {
            // console.log("access token still invalid. Invalidating authorization");
            // console.log(error);
            invalidateAuth();
          });
        })
        .catch((error) => {
          // console.log("access token still invalid. Invalidating authorization");
          // console.log(error);
          invalidateAuth();
        });
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
    setIsEdit(false);
    setEditId(-1);
    setEditIndex(-1);
    updateEditPath([], isAirPlane);
  };

  /**
   * Handles creating a new node.
   */
  const handleNewNode = () => {
    setCoordinates(prevVal => [...prevVal, ["", ""]]);
  }

  /**
   * Handles changing the mode to edit.
   * @param {*} path - the path to edit
   * @param {number} index - the index of the path
   */
  const handleEditPathMode = (path, index) => {
    if(isProcessing){
      return;
    }
    setIsEdit(true);
    setEditName(path.path_name);
    setEditId(path.path_uid);
    setEditIndex(index);
    setCoordinates(path.coordinates);
    setIsAirPlane(path.isAirPlane);
    updateEditPath(path.coordinates, path.isAirPlane);
  };

  /**
   * Handles deleting the landmark.
   * @param {*} path - the path to delete
   * @param {number} index - the index of the path
   */
  const handleDeletePath = (path, index) => {
    if(isProcessing){
      return;
    }

    let isConfirmed = window.confirm(`Are you sure you want to delete this path?\n\nname:\n${path.path_name === null ? "None" : path.path_name}\ncoordinates:\n${path.coordinates.map((element, index) => {
      return `${index + 1}. (${element[0]}, ${element[1]})\n`;
    }).join("")}`);
    if(isConfirmed){
      setIsProcessing(true);
      
      const body = {
        path_uid: path.path_uid
      };
      fetch(`/paths`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        setIsProcessing(false);
        setIsEdit(false);
        setTimeout(() => {
          deletePath(index);
        }, 500);
      })
      .catch((error) => {
        //access token is invalid, try to refresh the access token and try again
        // console.log("access token no longer valid, attempt to get new access token through refresh token");
        fetch(`/users/refreshToken`, {
          method: "POST",
          headers: {
            'authorization' : `Bearer ${localStorage.getItem('refreshToken')}` 
          }
        })
        .then(res => res.json())
        .then(res => {
          localStorage.setItem('token', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          // console.log("access token renewed, retrying deleting path");
          fetch(`/paths`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              'authorization' : `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
          })
          .then(res => res.json())
          .then(res => {
            console.log(res);
            setIsProcessing(false);
            setIsEdit(false);
            setTimeout(() => {
              deletePath(index);
            }, 500);
          })
          .catch((error) => {
            // console.log("access token still invalid. Invalidating authorization");
            // console.log(error);
            invalidateAuth();
          });
        })
        .catch((error) => {
          // console.log("access token not renewed. Invalidating authorization")
          // console.log(error);
          invalidateAuth();
        });
      });
    }
  };

  /**
   * Gets the edit path content.
   */
  const getEditPathContent = () => {
    // console.log(paths);
    return (
      <form>
        <FormControlLabel
          control={
            <Switch 
              checked={isAirPlane} 
              onChange={handleSwitchChange} 
              name="checkedA" 
              checkedIcon={<AirplanemodeActiveIcon/>}
              icon={<CommuteIcon/>}
            />
          }
          label="Travel Type"/>
        <TextField 
          id="pathName" 
          label="Path Name" 
          placeholder="e.g. LAX - HKG or California Trip 1" 
          value={editName}
          onChange={handleNameChange}
          fullWidth
          style={{marginBottom: "10px"}}/>
        {
          coordinates.map((element, index) => {
            return (
              <CoordinateFormItem
                latitude={element[1]}
                longitude={element[0]}
                onLatitudeChange={onElementLatitudeChange}
                onLongitudeChange={onElementLongitudeChange}
                onDelete={handleDeleteNode}
                index={index}/>
            );
          })
        }

        <Button variant="contained" color="primary" onClick={handleNewNode} fullWidth className={classes.addNode}> 
          <AddIcon className={classes.iconText}/> Add Node
        </Button>

        <Grid container justify="center">
          <Button variant="contained" color="primary" onClick={handleEditPath} className={classes.finishEditButton}>
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
    <Paper hidden={value !== index} square className={classes.root} elevation={0}>
      <Typography variant="h5">
        {isEdit ? "Edit Path" : "Path List"}
      </Typography>
      {
        !isEdit && paths.map((element, index) => {
          return(
            <Paper className={classes.nodeElement} elevation={2} key={element.id}>
              <IconButton>
                {isProcessing ? <CircularProgress style={{color: "white"}} size={24} color='secondary' disableShrink /> : <MyLocationIcon />}
              </IconButton>
              <IconButton color="primary" onClick={() => handleEditPathMode(element, index)}>
                {isProcessing ? <CircularProgress size={24} color='primary' disableShrink /> : <EditIcon />}
              </IconButton>
              <IconButton color="secondary" onClick={() => handleDeletePath(element, index)}>
                {isProcessing ? <CircularProgress size={24} color='secondary' disableShrink /> : <DeleteIcon />}
              </IconButton>
              <Typography variant="h6" className={classes.pathTypography}>
                {element.isAirPlane ? <AirplanemodeActiveIcon className={classes.iconText}/> : <CommuteIcon className={classes.iconText}/>} 
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