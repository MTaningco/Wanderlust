//Imports from libraries
import { Button, TextField, Typography } from "@material-ui/core";
import React, { Component, useState, useRef, useEffect } from "react";
import {  Redirect, Link } from "react-router-dom";

function SignUp() {
  //States
  // const [isTokenValid, setIsTokenValid] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);

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
      alert("At least one field is empty!");
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
        // console.log(error);
        alert("The username already exists! Please create an unowned username.");
      });
    }
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
    <div>
      <Typography component="h1" variant="h5">
        Sign Up
      </Typography>
      <form>
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
        />
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
        />
        Username Status: {isUsernameTaken ? "Taken" : "Available"}
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
        />
        Password Strength: {strengthIndicator(password)}
        <Button
          // type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          onClick={handleSignUp}
        >
          Sign Up
        </Button>
      </form>
      <Link to="/">Back to sign in screen</Link>
    </div>
  );
}

export default SignUp;