//Imports from libraries
import { Button, TextField, Typography, Toolbar, Grid } from "@material-ui/core";
import React, { Component, useState, useRef, useEffect } from "react";
import {  Redirect, Link } from "react-router-dom";
import AppBar from '@material-ui/core/AppBar';
import Image from './landing.png'; // Import using relative path

function SignIn() {
  //States
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Handles the change in username.
   * @param {*} event - the event for the username change
   */
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  /**
   * Handles the change in password.
   * @param {*} event - the event for the password change
   */
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  /**
   * Handles the signing in.
   */
  const handleSignIn = () => {
    setUsername("");
    setPassword("");

    const body = {
      "username": username,
      "password": password
    }
    
    fetch(`/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(res => {
      localStorage.setItem('token', res.token);
      setIsTokenValid(true);
    })
    .catch((error) => alert("Invalid credentials!"));
  };

  //Use effect hook.
  useEffect(() => {
    if(localStorage.getItem('token') !== null){
      fetch(`/users/checkToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'authorization' : `Bearer ${localStorage.getItem('token')}`
        },
      })
      .then(res => res.json())
      .then(res => {
        if(res.isTokenValid){
          setIsTokenValid(true);
        }
      });
    }
  }, []);

  /**
   * Gets the SignIn page content.
   */
  const getSignInContent = () => {
    if(isTokenValid){
      return (<Redirect to={{pathname:'/dashboard'}}/>);
    }
    else{
      return (
        <div>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6">
                Wanderlust
              </Typography>
            </Toolbar>
          </AppBar>
          <Grid container spacing={0}>
            <Grid item xs={8} style={{ padding: 60, backgroundImage: `url(${Image})`, backgroundSize: 'cover', height: '95vh' }}>
              <Typography component="h1" variant="h3">
                Record Your Travels. Personalize Your Globe.
              </Typography>
              <Typography component="h1" variant="h6">
                Wanderlust allows you to revisit places you have been to and even the journey you took to get there. With a clean design, you can see the globe in real time and take things into perspective.
              </Typography>
            </Grid>
            <Grid item xs={4} style={{ padding: 60 }}>
              <Typography component="h1" variant="h5">
                Sign In
              </Typography>
              <form>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={handleUsernameChange}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              </form>
              <Link to="/signUp">Don't have an account? Sign up</Link>
            </Grid>
          </Grid>
          
        </div>
      );
    }
  };

  return (
    <div>
      {getSignInContent()}
    </div>
  );
}

export default SignIn;