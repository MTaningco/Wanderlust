//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import AppBar from '@material-ui/core/AppBar';
import { Typography, Toolbar } from "@material-ui/core";
import {
  Link
} from "react-router-dom";

function LoggedOut() {

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">
                        Wanderlust
                    </Typography>
                </Toolbar>
            </AppBar>
            <Typography variant="h4" style={{ padding: 60 }}>
                Session has expired. Please sign back in.
            </Typography>
            <Link to="/" style={{ padding: 60 }}>Back to Sign In</Link>
        </div>
    );
}

export default LoggedOut;