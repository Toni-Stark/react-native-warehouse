import React, {Component} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {scaleSizeW, setSpText} from '../../../common/shepei';

export default class FixedButtonBottom extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}
  render() {
    if (this.props.visible) {
      return (
        <TouchableOpacity onPress={this.props.onPress}>
          <View style={styles.formItem}>
            <Text style={styles.name}>{this.props.name}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  formItem: {
    width: '100%',
    backgroundColor: '#1c84bb',
    height: scaleSizeW(100),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#ffffff',
    fontSize: setSpText(40),
  },
});
