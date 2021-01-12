import './App.css';
import React, { Component, useState, useRef, useEffect } from "react";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Dashboard from './Dashboard';
import SignIn from './SignIn';
import LoggedOut from './LoggedOut';
import SignUp from './SignUp';

const theme = createMuiTheme({
  palette: {
    type: "dark",
  }
});

function App() {
  
  useEffect(() => {
    document.title = 'Wanderlust';
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={SignIn}/>
          <Route exact path='/dashboard' component={Dashboard}/>
          <Route exact path='/loggedOut' component={LoggedOut}/>
          <Route exact path='/signUp' component={SignUp}/>
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
