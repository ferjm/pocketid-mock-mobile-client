'use strict';

import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native';

import Dimensions from 'Dimensions';
const windowSize = Dimensions.get('window');

const server = 'http://localhost:8080';

class AppView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ''
    }
  }

  onGo() {
    if (!this.state.username || !this.state.username.length) {
      return;
    }
    console.log('Registering user', this.state.username);
    fetch(server + '/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.username
      })
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      console.log(json);
      if (!json.ws) {
        console.error('Missing ws url');
        return;
      }
      const ws = new WebSocket(json.ws);
      ws.onopen = () => {
        console.log('Connection opened');
      };
      ws.onmessage = (e) => {
        console.log('Message ', e.data);
      };
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return(
      <View style={styles.container}>
        <Image style={styles.bg} source={require('./img/bg.png')} />
        <View style={styles.header}>
          <Image style={styles.mark} source={require('./img/logo.png')} />
        </View>
        <View style={styles.instructions}>
          <Text style={styles.whiteFont}>Enter your email and click Go!</Text>
        </View>
        <View style={styles.inputs}>
          <View style={styles.inputContainer}>
              <Image style={styles.inputUsername}
                     source={require('./img/user.png')}/>
              <TextInput
                  style={[styles.input, styles.whiteFont]}
                  placeholder='Email'
                  placeholderTextColor='#FFF'
                  returnKeyType='go'
                  enablesReturnKeyAutomatically={true}
                  keyboardType='email-address'
                  onChangeText={(username) => this.setState({username})}
                  onSubmitEditing={this.onGo.bind(this)}
              />
          </View>

          <View style={styles.broadcast}>
            <TouchableHighlight onPress={this.onGo.bind(this)}>
              <Text style={styles.whiteFont}>Go!</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: 'transparent'
  },
  bg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: windowSize.width,
    height: windowSize.height
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: .2,
    backgroundColor: 'transparent'
  },
  mark: {
    width: 150,
    height: 150
  },
  instructions: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: .1,
    backgroundColor: 'transparent'
  },
  inputs: {
    marginTop: 10,
    marginBottom: 10,
    flex: .25
  },
  inputUsername: {
    marginLeft: 15,
    width: 20,
    height: 20
  },
  inputContainer: {
    padding: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderBottomColor: '#CCC',
    borderColor: 'transparent'
  },
  input: {
    position: 'absolute',
    left: 61,
    top: 12,
    right: 0,
    height: 20,
    fontSize: 14
  },
  whiteFont: {
    color: '#FFF'
  },
  broadcast: {
    backgroundColor: '#FF3366',
    padding: 20,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  }
});

module.exports = AppView;
