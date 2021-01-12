//Imports from libraries
import { Button, TextField, Typography } from "@material-ui/core";
import React, { Component, useState, useRef, useEffect } from "react";
import {  Redirect, Link } from "react-router-dom";

function SignUp() {

  // const [isTokenValid, setIsTokenValid] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSignUp = () => {
    setUsername("");
    setPassword("");
    setEmail("");

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
    })
    .catch((error) => console.log(error));
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

  // const getSignInContent = () => {
  //   if(isTokenValid){
  //     return (<Redirect to={{pathname:'/dashboard'}}/>);
  //   }
  //   else{
  //     return (
  //       <div>
  //         <Typography component="h1" variant="h5">
  //           Sign Up
  //         </Typography>
  //         <form>
  //           <TextField
  //             variant="outlined"
  //             margin="normal"
  //             required
  //             fullWidth
  //             id="email"
  //             label="Email"
  //             name="email"
  //             autoComplete="email"
  //             autoFocus
  //             value={email}
  //             onChange={handleEmailChange}
  //           />
  //           <TextField
  //             variant="outlined"
  //             margin="normal"
  //             required
  //             fullWidth
  //             id="username"
  //             label="Username"
  //             name="username"
  //             autoComplete="username"
  //             value={username}
  //             onChange={handleUsernameChange}
  //           />
  //           <TextField
  //             variant="outlined"
  //             margin="normal"
  //             required
  //             fullWidth
  //             name="password"
  //             label="Password"
  //             type="password"
  //             id="password"
  //             autoComplete="current-password"
  //             value={password}
  //             onChange={handlePasswordChange}
  //           />
  //           <Button
  //             type="submit"
  //             fullWidth
  //             variant="contained"
  //             color="primary"
  //             onClick={handleSignUp}
  //           >
  //             Sign Up
  //           </Button>
  //         </form>
  //         <Link to="/">Back to sign in screen</Link>
  //       </div>
  //     );
  //   }
  // };

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
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
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