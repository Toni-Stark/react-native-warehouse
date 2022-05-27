import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ToastAndroid,
  BackHandler,
} from 'react-native';
import {Text, Input, Button} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {scaleSizeH, scaleSizeW, setSpText} from './../../common/shepei';

export default class SetUrl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      loading: false,
    };
  }

  async componentDidMount() {
    var url = await AsyncStorage.getItem('url');
    if (url != null) {
      this.setState({
        url: url,
      });
    } else if (url == null) {
      this.setState({
        url: 'http://api.drug.360zhishu.cn',
      });
    }
  }

  handleSumbit() {
    AsyncStorage.setItem('url', this.state.url);
    ToastAndroid.showWithGravity('设置成功！', 2000, ToastAndroid.SHORT);
    this.props.navigation.goBack();
  }

  handleInput(text) {
    this.setState({
      url: text,
    });
  }

  render() {
    return (
      <View>
        <TextInput
          style={styles.loginInput}
          onChangeText={text => this.handleInput(text)}
          placeholder="请输入网关"
          value={this.state.url}></TextInput>
        <Button
          title="设置网关"
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
          onPress={() => this.handleSumbit()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loginInput: {
    width: scaleSizeW(650),
    height: scaleSizeW(100),
    borderColor: '#999999',
    borderWidth: 1,
    marginLeft: scaleSizeW(50),
    marginRight: scaleSizeW(50),
    marginBottom: scaleSizeW(60),
    marginTop: scaleSizeH(200),
    paddingLeft: scaleSizeW(20),
    paddingRight: scaleSizeW(20),
  },
});
