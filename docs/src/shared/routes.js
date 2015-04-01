import React from 'react';
import { Route, Redirect, DefaultRoute } from 'react-router';
import AppHandler from './components/AppHandler';
import HomeHandler from './components/HomeHandler';
import DocHandler from './components/DocHandler';

export default (
  <Route name="app" path="/" handler={AppHandler}>
    <Route name="home" path="/flummox" handler={HomeHandler} />
    <Route name="doc" path="/flummox/docs/*" handler={DocHandler} />
    <Redirect from="*" to="home" />
  </Route>
);
