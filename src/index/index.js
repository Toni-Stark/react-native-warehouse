import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {scaleSizeH, scaleSizeW} from '../../common/shepei';
const sHeight = Dimensions.get('window').height - 80;

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag: false,
    };
  }

  componentDidMount() {
    this.handleJump();
    DeviceEventEmitter.addListener('token', () => {
      this.setState({
        flag: true,
      });
    });
  }

  async handleJump(e) {
    let token = await AsyncStorage.getItem('token');
    if (token == null) {
      return this.props.navigation.navigate('Login');
    } else {
      this.setState({
        flag: true,
      });
    }
    if (e != undefined) {
      this.props.navigation.navigate(e);
    }
  }

  render() {
    return (
      <View style={this.state.flag ? styles.navBox : styles.none}>
        <View style={styles.stewardBox}>
          <TouchableOpacity
            style={styles.stewardItem}
            activeOpacity={0.8}
            onPress={() => this.handleJump('OrderInquiry')}>
            <Image
              style={styles.stewardImg}
              source={require('../../static/img/dingdan.png')}></Image>
            <Text style={styles.stewardText}>下账查询</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stewardItem}
            activeOpacity={0.8}
            onPress={() => this.handleJump('DrugChecking')}>
            <Image
              style={styles.stewardImg}
              source={require('../../static/img/pandian.png')}></Image>
            <Text style={styles.stewardText}>商品盘点</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.stewardBox}>
          <TouchableOpacity
            style={styles.stewardItem}
            activeOpacity={0.8}
            onPress={() => this.handleJump('GoodsWarehousing')}>
            <Image
              style={styles.stewardImg}
              source={require('../../static/img/ruku.png')}></Image>
            <Text style={styles.stewardText}>商品入库</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stewardItem}
            activeOpacity={0.8}
            onPress={() => this.handleJump('Shipment')}>
            <Image
              style={styles.stewardImg}
              source={require('../../static/img/chuku.png')}></Image>
            <Text style={styles.stewardText}>出库验货</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.stewardBox}>
          <TouchableOpacity style={styles.stewardItem}>
            <Image
              style={styles.stewardImg}
              source={require('../../static/img/tuihuo.png')}></Image>
            <Text style={styles.stewardText}>退货入库</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stewardItem}
            activeOpacity={0.8}
            onPress={() => this.handleJump('QueryDrugs')}>
            <Image
              style={styles.stewardImg}
              source={require('../../static/img/yanhuo.png')}></Image>
            <Text style={styles.stewardText}>商品查询</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.stewardBox}>
                    <TouchableOpacity style={styles.stewardItem} activeOpacity={0.8} onPress={() => this.handleJump('Login')}>
                        <Image style={styles.stewardImg} source={require('../../static/img/zicha.png')}></Image>
                        <Text style={styles.stewardText}>登录</Text>
                    </TouchableOpacity>
                </View> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  none: {
    display: 'none',
  },

  navBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: sHeight,
  },

  stewardBox: {
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginTop: scaleSizeH(70),
    width: scaleSizeW(650),
  },

  stewardItem: {
    width: 112,
    height: 112,
    borderColor: '#999',
    borderWidth: 1,
  },

  stewardImg: {
    width: 68,
    height: 68,
    marginTop: 12,
    marginLeft: 22,
  },

  stewardText: {
    width: 110,
    textAlign: 'center',
    marginTop: scaleSizeH(5),
  },
});
