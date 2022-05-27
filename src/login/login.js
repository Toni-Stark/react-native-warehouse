import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ToastAndroid,
  BackHandler,
  DeviceEventEmitter,
} from 'react-native';
import {Text, Input, Button} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import {scaleSizeH, scaleSizeW, setSpText} from './../../common/shepei';
import {postData} from '../../common/request';
export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      password: '',
      loading: false,
      show: false,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    );
  }

  onBackButtonPressAndroid = () => {
    if (this.props.navigation.isFocused()) {
      if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
        //最近2秒内按过back键，可以退出应用。
        BackHandler.exitApp();
        return false;
      }
      this.lastBackPressed = Date.now();
      ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);

      return true;
    }
  };

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    );
  }

  handleSumit() {
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      this.setState({loading: false});
    }, 2000);
    if (!this.state.user) {
      return ToastAndroid.showWithGravity(
        '请输入用户账号！',
        2000,
        ToastAndroid.SHORT,
      );
    }
    if (!this.state.password) {
      return ToastAndroid.showWithGravity(
        '请输入用户密码！',
        2000,
        ToastAndroid.SHORT,
      );
    }
    var formdata = new FormData();
    formdata.append('login_name', this.state.user);
    formdata.append('login_pwd', this.state.password);
    postData('user/login', formdata).then(res => {
      if (res.code != 200) {
        return ToastAndroid.showWithGravity(
          '登录失败',
          2000,
          ToastAndroid.SHORT,
        );
      }

      AsyncStorage.setItem('token', res.data.token);
      DeviceEventEmitter.emit('token', {token: res.data.token});
      setTimeout(() => {
        ToastAndroid.showWithGravity('登录成功！', 2000, ToastAndroid.SHORT);
        this.props.navigation.navigate('Index');
      }, 2000);
    });
  }

  handleInput(text, type) {
    if (type == 1) {
      this.setState({
        user: text,
      });
    } else if (type == 0) {
      this.setState({
        password: text,
      });
    }
  }

  render() {
    return (
      <View>
        <Text style={this.state.show ? '' : styles.none}>1111</Text>
        <Text style={styles.loginTitlt}>药房门店智能管家</Text>
        <TextInput
          style={styles.loginInput}
          onChangeText={(text, type = 1) => this.handleInput(text, type)}
          placeholder="请输入登录用户名"
        />
        <TextInput
          style={styles.loginInput}
          secureTextEntry={true}
          onChangeText={(text, type = 0) => this.handleInput(text, type)}
          placeholder="请输入登录密码"
        />
        <Button
          title="登录"
          loading={this.state.loading}
          titleStyle={{fontWeight: '700'}}
          buttonStyle={{
            backgroundColor: '#169BD5',
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 5,
            paddingVertical: 5,
            height: 50,
          }}
          containerStyle={{
            width: scaleSizeW(600),
            height: 50,
            marginHorizontal: scaleSizeW(75),
            marginVertical: 10,
          }}
          onPress={() => this.handleSumit()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  none: {
    display: 'none',
  },

  loginTitlt: {
    width: scaleSizeW(750),
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: setSpText(40),
    marginTop: scaleSizeH(120),
    marginBottom: scaleSizeW(100),
  },

  loginInput: {
    width: scaleSizeW(650),
    height: scaleSizeW(100),
    borderColor: '#999999',
    borderWidth: 1,
    marginLeft: scaleSizeW(50),
    marginRight: scaleSizeW(50),
    marginBottom: scaleSizeW(60),
    paddingLeft: scaleSizeW(20),
    paddingRight: scaleSizeW(20),
  },
});
