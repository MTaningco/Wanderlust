//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import {
  Link
} from "react-router-dom";

function LoggedOut() {

    return (
        <div>
            <br/>
            Session has expired. Please sign back in.
            <br/>
            <Link to="/">Back to Sign In</Link>
        </div>
    );
}

export default LoggedOut;