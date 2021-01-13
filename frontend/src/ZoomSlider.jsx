//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';
import Slider from '@material-ui/core/Slider';

function ZoomSlider({ scale, handleChangeScale }) {
  const marks = [
    {
      value: 1,
      label: 'Full View',
    },
    {
      value: 2,
      label: 'Half View',
    },
    {
      value: 4.24733333333,
      label: '3000 km',
    },
    {
      value: 8.49466666667,
      label: '1500 km',
    },
    {
      value: 12.742,
      label: '1000 km',
    },
    {
      value: 16.9893333333,
      label: '750 km',
    },
    {
      value: 21.2366666667,
      label: '600 km',
    },
    {
      value: 25.484,
      label: '500 km',
    },
  ];

  return (
    <div style={{height:"100%"}}>
      <Typography id="vertical-slider" gutterBottom>
        <SearchIcon/>
      </Typography>
      <Slider
        orientation="vertical" value={scale} onChange={handleChangeScale}
        aria-labelledby="vertical-slider" step={0.01}
        min={1}
        max={25.484}
        marks={marks}
      />
    </div>
  );
}

export default ZoomSlider;