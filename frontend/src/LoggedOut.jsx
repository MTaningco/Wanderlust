//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import { Typography, Toolbar, Grid } from "@material-ui/core";
import { Link } from "react-router-dom";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import ScheduleIcon from '@material-ui/icons/Schedule';

/**
 * Styles used for the component.
 * @param  {*} theme - the theme of the application
 */
const useStyles = makeStyles((theme) => ({
  link: {
    padding: 60,
    color: "#7096ff",
    textDecoration: "none",
    fontSize: "17px",
    fontWeight: "bold"
  },
  timerIcon: {
    width: "30%",
    height: "30%"
  },
}));

function LoggedOut() {
  const classes = useStyles();

  return (
    <div>
      <Grid container
        spacing={0}
        align="center"
        justify="center"
        direction="column" style={{ height: "100vh", flexGrow: 1 }}>
        <Grid item>
          <ScheduleIcon className={classes.timerIcon} />
          <Typography variant="h4" style={{ padding: 60 }}>
            Session has expired. Please sign back in.
          </Typography>
          <Link to="/" className={classes.link}>Back to Sign In</Link>
        </Grid>
      </Grid>
    </div>
  );
}

export default LoggedOut;