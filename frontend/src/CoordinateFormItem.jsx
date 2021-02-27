//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Input, Typography, Paper, FormControl, InputLabel } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, useTheme } from '@material-ui/core/styles';

/**
 * Styles used for the component.
 * @param  {*} theme - the theme of the application
 */
const useStyles = makeStyles((theme) => ({
  nodeElement: {
    position: 'relative',
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
  }
}));

function CoordinateFormItem({latitude, longitude, onLatitudeChange, onLongitudeChange, onDelete, index}) {
  const classes = useStyles();

  var latId = `nodeLatitude1_${index}`;
  var longitudeId = `nodeLongitude_${index}`;

  return (
    <Paper className={classes.nodeElement} elevation={2} key={index}>
      <Typography>Node {index + 1}</Typography>
      <FormControl fullWidth>
        <InputLabel htmlFor={latId}>Latitude</InputLabel>
        <Input 
          type="number" 
          id={latId}
          placeholder="Enter value between -90 to 90" 
          name="Latitude"
          value={latitude}
          onChange={(event) => onLatitudeChange(event, index)} />
      </FormControl>
      <FormControl fullWidth>
        <InputLabel htmlFor={longitudeId}>Longitude</InputLabel>
        <Input 
          type="number" 
          id={longitudeId}
          placeholder="Enter value between -180 to 180" 
          name="Longitude"
          value={longitude}
          onChange={(event) => onLongitudeChange(event, index)} />
      </FormControl>
      <IconButton color="secondary" className={classes.deleteButton} onClick={() => onDelete(index)}>
        <CloseIcon/>
      </IconButton>
    </Paper>
  );
}

export default CoordinateFormItem;