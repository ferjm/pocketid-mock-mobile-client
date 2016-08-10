'use strict';

import React, { Component } from 'react';
import {
  Image,
  Navigator,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native';

import Dimensions from 'Dimensions';
const windowSize = Dimensions.get('window');

import Spinner from 'react-native-spinkit';

const server = 'http://localhost:8080';

class LoginView extends Component {
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
      if (!json.userid) {
        console.error('Missing user id');
        return;
      }
      const ws = new WebSocket(json.ws);
      ws.onopen = () => {
        this.props.navigator.push({
          component: VerificationView,
          passProps: {
            username: this.state.username,
            userid: json.userid,
            ws: ws
          }
        })
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
          <Text style={styles.whiteFont}>Pick your security image...</Text>
          <Image style={styles.mark} source={require('./img/logo.png')} />
        </View>
        <View style={styles.instructions}>
          <Text style={styles.whiteFont}>...enter your email and click Go!</Text>
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
                  autoCapitalize='none'
                  onChangeText={(username) => this.setState({username})}
                  onSubmitEditing={this.onGo.bind(this)}
              />
          </View>

          <View style={styles.button}>
            <TouchableHighlight onPress={this.onGo.bind(this)}>
              <Text style={styles.whiteFont}>Go!</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
}

class VerificationView extends Component {
  onCancel() {
    this.props.navigator.push({
      component: LoginView,
      passProps: {
        username: this.props.username,
        userid: this.props.userid,
        ws: this.props.ws
      }
    })
  }

  componentDidMount() {
    this.props.ws.onmessage = (e) => {
      if (e.data == 'verified') {
        this.props.navigator.push({
          component: BroadcastView,
          passProps: {
            username: this.props.username,
            userid: this.props.userid,
            ws: this.props.ws
          }
        })
      }
    }

    this.props.ws.onclose = () => {
      this.onCancel();
    }
  }

  render() {
    return(
      <View style={styles.greenContainer}>
        <View style={styles.header}>
          <Spinner color={'#FFFFFF'} size={100} type={'ThreeBounce'}/>
        </View>
        <View style={styles.instructions}>
          <Text style={styles.title}>
            Waiting for email verification
          </Text>
          <Text style={styles.subtitle}>
            Please, check your email to verify your identity and start broadcasting
          </Text>
        </View>
        <View style={styles.inputs}>
          <View style={styles.button}>
            <TouchableHighlight onPress={this.onCancel.bind(this)}>
              <Text style={styles.whiteFont}>Cancel verification</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    )
  }
}

class BroadcastView extends Component {
  onCancel() {
    this.props.navigator.push({
      component: LoginView,
      passProps: {}
    })
  }

  render() {
    return(
      <View style={styles.greenContainer}>
        <View style={styles.header}>
          <Spinner color={'#FFFFFF'} size={200} type={'Pulse'}/>
        </View>
        <View style={styles.instructions}>
          <Text style={styles.title}>
            Broadcasting identity
          </Text>
          <Text style={styles.subtitle}>
            You are logged as {this.props.username}
          </Text>
        </View>
        <View style={styles.inputs}>
          <View style={styles.button}>
            <TouchableHighlight onPress={this.onCancel.bind(this)}>
              <Text style={styles.whiteFont}>Stop</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    )
  }
}

export default class AppView extends Component {
  render() {
    return(
      <Navigator
        initialRoute={{ index: 0, component: LoginView }}
        renderScene={(route, navigator) => {
          if (route.component) {
            return React.createElement(route.component, {
              ...this.props,
              ...route.passProps,
              navigator,
              route
            });
          }
        }}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: 'transparent'
  },
  greenContainer: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#1abc9c'
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
    backgroundColor: 'transparent',
    marginTop: 10
  },
  mark: {
    width: 150,
    height: 150,
    marginTop: 20
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
  title: {
    color: '#FFF',
    fontSize: 25,
    padding: 10,
    alignItems: 'center'
  },
  subtitle: {
    color: '#FFF',
    fontSize: 10,
    padding: 10,
    alignItems: 'center'
  },
  button: {
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
