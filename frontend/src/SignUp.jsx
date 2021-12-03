//Imports from libraries
import { Button, Container, Grid, TextField, Typography, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions } from "@material-ui/core";
import React, { Component, useState, useRef, useEffect } from "react";
import {  Redirect, Link } from "react-router-dom";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import SignalCellular0BarIcon from '@material-ui/icons/SignalCellular0Bar';
import SignalCellular1BarIcon from '@material-ui/icons/SignalCellular1Bar';
import SignalCellular2BarIcon from '@material-ui/icons/SignalCellular2Bar';
import SignalCellular3BarIcon from '@material-ui/icons/SignalCellular3Bar';
import SignalCellular4BarIcon from '@material-ui/icons/SignalCellular4Bar';

/**
 * Styles used for the component.
 * @param  {*} theme - the theme of the application
 */
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: "column",
    alignItems: 'center',
    maxWidth: '700px',
    marginTop: '30%'
  },
  form: {
    width: '100%'
  },
  link: {
    color: "#7096ff", 
    textDecoration: "none", 
    fontSize: "17px", 
    fontWeight: "bold"
  },
  checkIcon: {
    color: "green"
  },
  clearIcon: {
    color: "red"
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    fontSize: "15px"
  },
  veryWeakStrength: {
    color: "red"
  },
  weakStrength: {
    color: "orange"
  },
  fairStrength: {
    color: "yellow"
  },
  goodStrength: {
    color: "lime"
  },
  strongStrength: {
    color: "green"
  },
  dialog: {
    minWidth: '700px'
  }
}));

function SignUp() {
  const classes = useStyles();
  //States
  // const [isTokenValid, setIsTokenValid] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");

  /**
   * Checks if a string has a number.
   * @param {String} value - the string used to check if it has a number
   */
  const hasNumber = value => {
    return new RegExp(/[0-9]/).test(value);
  }

  /**
   * Checks if a string has mixed caps.
   * @param {String} value - the string used to check if it has mixed caps
   */
  const hasMixed = value => {
    return new RegExp(/[a-z]/).test(value) && new RegExp(/[A-Z]/).test(value);
  }

  /**
   * Checks if a string has special characters
   * @param {*} value - the string used to check if it has special characters
   */
  const hasSpecial = value => {
    return new RegExp(/[!#@$%^&*)(+=._-]/).test(value);
  }

  /**
   * Gets the human readable value of a password strength.
   * @param {number} count - the password strength
   */
  const strengthMagnitude = count => {
    if (count < 2)
      return 'Very Weak';
    if (count < 3)
      return 'Weak';
    if (count < 4)
      return 'Fair';
    if (count < 5)
      return 'Good';
    if (count < 6)
      return 'Strong';
  }

  /**
   * Gets the strength of a password.
   * @param {String} value - the string used to check the strenght of a password
   */
  const strengthIndicator = value => {
    let strengths = 0;
    if (value.length > 5)
      strengths++;
    if (value.length > 7)
      strengths++;
    if (hasNumber(value))
      strengths++;
    if (hasSpecial(value))
      strengths++;
    if (hasMixed(value))
      strengths++;
    return strengthMagnitude(strengths);
  }

  /**
   * Renders the content for the password strength.
   * @param {number} value - the numerical strength indicator of a password
   */
  const renderPasswordStrength = value => {
    switch(value){
      case 'Very Weak':
        return (<SignalCellular0BarIcon className={classes.veryWeakStrength}/>);
      case 'Weak':
        return (<SignalCellular1BarIcon className={classes.weakStrength}/>);
      case 'Fair':
        return (<SignalCellular2BarIcon className={classes.fairStrength}/>);
      case 'Good':
        return (<SignalCellular3BarIcon className={classes.goodStrength}/>);
      default:
        return (<SignalCellular4BarIcon className={classes.strongStrength}/>);
    }
  };

  /**
   * Handles the username change.
   * @param {*} event - the event for the username change
   */
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
    getUsernameStatus(event.target.value);
  };

  /**
   * Handles the password change.
   * @param {*} event - the event for the password change
   */
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  /**
   * Handles the email change.
   * @param {*} event - the event for the email change
   */
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  /**
   * Gets the availability of the username
   * @param {String} value - the string used to check the availability of a username
   */
  const getUsernameStatus = (value) => {
    fetch(`/users/exists?username=${value}`)
    .then(res => res.json())
    .then(res => {
      setIsUsernameTaken(res.isexist === "true" ? true : false);
    })
  }

  /**
   * Handles the user signing up.
   */
  const handleSignUp = () => {
    if(email === "" || password === "" || username === ""){
      // alert("At least one field is empty!");
      setDialogTitle("Sign Up Incomplete");
      setDialogContent("At least one field is empty!");
      setIsDialogOpen(true);
    }
    else{
      const body = {
        "email": email,
        "password" : password,
        "username" : username
      }
  
      fetch(`/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json())
      .then(res => {
        setUsername("");
        setPassword("");
        setEmail("");
        alert("A new user has been made!");
      })
      .catch((error) => {
        setDialogTitle("Username Taken");
        setDialogContent("The username already exists! Please create an unowned username.");
        setIsDialogOpen(true);
      });
    }
  };

  /**
   * Handles closing the dialog.
   */
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  // useEffect(() => {
  //   if(localStorage.getItem('token') !== null){
  //     fetch(`/users/checkToken`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         'authorization' : `Bearer ${localStorage.getItem('token')}`
  //       },
  //     })
  //     .then(res => res.json())
  //     .then(res => {
  //       if(res.isTokenValid){
  //         setIsTokenValid(true);
  //       }
  //     });
  //   }
  // }, []);

  return (
    <Container maxWidth="xs">
      <div className={classes.root}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <form className={classes.form}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            className={classes.textField}
            inputProps={{maxLength: 255}}/>
          <br/>
          <br/>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            autoComplete="username"
            value={username}
            onChange={handleUsernameChange}
            className={classes.textField}
            inputProps={{maxLength: 100}}/>
          <br/>
          <Typography className={classes.hint}>
            Username Status: {isUsernameTaken ? "Taken" : "Available"}
            {isUsernameTaken ? <ClearIcon className={classes.clearIcon}/> : <CheckIcon className={classes.checkIcon}/>}
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            className={classes.textField}/>
          <br/>
          <Typography className={classes.hint}>
            Password Strength: {strengthIndicator(password)}
            {renderPasswordStrength(strengthIndicator(password))}
          </Typography>
          <br/>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSignUp}
            className={classes.textField}>
            Sign Up
          </Button>
        </form>
        <br/>
        <Grid container justify="flex-start">
          <Grid item>
            <Link className={classes.link} to="/">Back to sign in screen</Link>
          </Grid>
        </Grid>
      </div>
      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={classes.dialog}
        fullWidth>
          <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {dialogContent}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>
              OK
            </Button>
          </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SignUp;