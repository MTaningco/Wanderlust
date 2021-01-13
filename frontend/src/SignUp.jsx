//Imports from libraries
import { Button, TextField, Typography } from "@material-ui/core";
import React, { Component, useState, useRef, useEffect } from "react";
import {  Redirect, Link } from "react-router-dom";

function SignUp() {

  // const [isTokenValid, setIsTokenValid] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);

  const hasNumber = value => {
    return new RegExp(/[0-9]/).test(value);
  }
  const hasMixed = value => {
    return new RegExp(/[a-z]/).test(value) && new RegExp(/[A-Z]/).test(value);
  }
  const hasSpecial = value => {
    return new RegExp(/[!#@$%^&*)(+=._-]/).test(value);
  }

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

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
    getUsernameStatus(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const getUsernameStatus = (value) => {
    fetch(`/users/exists?username=${value}`)
    .then(res => res.json())
    .then(res => {
      setIsUsernameTaken(res.isexist === "true" ? true : false);
    })
  }

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
  
      console.log("body used for signing in", body);
  
      fetch(`/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json())
      .then(res => {
        // console.log("result of signing in", res);
        // localStorage.setItem('token', res.token);
        // setIsTokenValid(true);
        setUsername("");
        setPassword("");
        setEmail("");
        alert("A new user has been made!")
      })
      .catch((error) => alert("The username already exists! Please create an unowned username."));
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
          name="email"
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
          name="username"
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
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={handlePasswordChange}
        />
        Password Strength: {strengthIndicator(password)}
        <Button
          type="submit"
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