import logo from './logo.svg';
import './App.css';
import Globe from './Globe';
import * as d3 from 'd3';
import * as topojson from "topojson";
import data from "./GeoChart.world.geo.json";
import Slider from '@material-ui/core/Slider';
import React, { Component, useState, useRef, useEffect } from "react";
import { Grid } from '@material-ui/core';

function App() {

  const [scale, setScale] = React.useState(400);

  // const clientHeight = document.getElementById('globeGrid').clientHeight;

  const handleChangeScale = (event, newValue) => {
    setScale(newValue);
  };
  // const world = d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(res => console.log(res));
  return (
    <div className="App">
      <Grid container spacing={0} >
        <Grid item xs={11} id="globeGrid">
          <Globe scale={scale} size={900} />
        </Grid>
        <Grid item xs={1}>
          <Slider
            orientation="vertical" value={scale} onChange={handleChangeScale}
            aria-labelledby="vertical-slider" step={1}
            min={300}
            max={5892}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
