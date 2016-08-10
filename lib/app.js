'use strict';

import React, { Component } from 'react';
import {
  Image,
  NativeModules,
  Navigator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Dimensions from 'Dimensions';
const windowSize = Dimensions.get('window');
import Spinner from 'react-native-spinkit';
import ImagePicker from 'react-native-image-picker';

const server = 'http://localhost:8080';

class LoginView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      securityImage: require('./img/fingerprint.png')
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
            securityImage: this.state.securityImage,
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

  onSelectImage() {
    var options = {
      title: 'Select security image',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        // You can display the image using either data...
        const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

        // or a reference to the platform specific asset location
        if (Platform.OS === 'ios') {
          const source = {uri: response.uri.replace('file://', ''), isStatic: true};
        } else {
          const source = {uri: response.uri, isStatic: true};
        }

        this.setState({
          securityImage: source
        });
      }
    });
  }

  render() {
    return(
      <View style={styles.container}>
        <Image style={styles.bg} source={require('./img/bg.png')} />
        <View style={styles.header}>
          <Text style={styles.whiteFont}>Pick your security image...</Text>
          <TouchableWithoutFeedback onPress={this.onSelectImage.bind(this)}>
            <Image style={styles.mark} source={this.state.securityImage} />
          </TouchableWithoutFeedback>
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
      passProps: {}
    })
  }

  componentDidMount() {
    this.props.ws.onmessage = (e) => {
      if (e.data == 'verified') {
        this.props.navigator.push({
          component: BroadcastView,
          passProps: {
            securityImage: this.props.securityImage,
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
        <View style={styles.center}>
          <Spinner color={'#FFFFFF'} size={500} type={'Pulse'}/>
        </View>
        <View style={styles.instructions}>
          <Text style={styles.title}>
            Broadcasting identity
          </Text>
          <Text style={styles.subtitle}>
            You are logged in as {this.props.username}
          </Text>
          <Text style={styles.subtitle}>
            and this is your security image
          </Text>
          <Image style={styles.mark} source={this.props.securityImage} />
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

class AuthorizationView extends Component {
  onAllow() {
  }

  onDeny() {
  }

  render() {
    return(
      <View style={styles.grayContainer}>
        <View style={styles.authHeader}>
          <Image style={styles.mark} source={require('./img/identity.png')} />
        </View>
        <View style={styles.auth}>
          <Text style={styles.whiteFont}>Do you want to allow</Text>
          <Text style={styles.title}>facebook.com</Text>
          <Text style={styles.whiteFont}>to use your identity?</Text>
        </View>
          <View style={styles.twoButtons}>
            <View style={styles.allowButton}>
              <TouchableHighlight onPress={this.onAllow.bind(this)}>
                <Text style={styles.whiteFont}>Stop</Text>
              </TouchableHighlight>
            </View>
            <View style={styles.denyButton}>
              <TouchableHighlight onPress={this.onAllow.bind(this)}>
                <Text style={styles.whiteFont}>Stop</Text>
              </TouchableHighlight>
            </View>
          </View>
      </View>
    );
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
  grayContainer: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#34495e'
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
  authHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: .2,
    backgroundColor: 'transparent',
    marginTop: 100
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: .4,
    backgroundColor: 'transparent',
    marginTop: 10
  },
  mark: {
    width: 150,
    height: 150,
    marginTop: 20,
    borderRadius: 30
  },
  instructions: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: .1,
    backgroundColor: 'transparent'
  },
  auth: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: .5,
    backgroundColor: 'transparent',
    marginBottom: 150
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
  },
  twoButtons: {
    backgroundColor: 'transparent',
    padding: 20,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
	  alignSelf: 'stretch',
	  alignItems: 'center',
	  justifyContent: 'center'
  },
  allowButton: {
    backgroundColor: '#1abc9c',
    flex: 1
  },
  denyButton: {
    backgroundColor: '#FF3366',
    flex: 4
  }
});

module.exports = AppView;
