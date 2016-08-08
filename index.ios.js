'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import App from './lib/app.js';

class pocketid extends Component {
  render() {
    return (
      <App/>
    );
  }
}

AppRegistry.registerComponent('pocketid', () => pocketid);
