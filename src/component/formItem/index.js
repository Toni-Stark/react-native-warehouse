import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {scaleSizeW, setSpText} from '../../../common/shepei';

export default class FormItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const {name, message} = this.props;
    return (
      <View style={styles.formItem}>
        <Text style={styles.name}>{name}:</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  formItem: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingBottom: scaleSizeW(10),
  },
  name: {
    textAlign: 'left',
    color: '#333',
    fontSize: setSpText(30),
    width: scaleSizeW(130),
  },
  message: {
    textAlign: 'left',
    color: '#333',
    fontSize: setSpText(30),
    flex: 1,
    flexWrap: 'wrap',
  },
});
