import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
  NativeEventEmitter,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import IdataScanner from 'react-native-idata-scanner';
import {getData} from '../../common/request';
import {EasyLoading, Loading} from './../../common/Loading.js';

import {scaleSizeH, scaleSizeW, setSpText} from './../../common/shepei';
export default class QueryDrugs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      medicineInfo: {},
      QRcode: '请扫描货物条形码新增商品',
      show: false,
      queryFlag: false,
    };
  }

  componentDidMount() {
    this.registePdaEvent();
  }

  registePdaEvent() {
    //设置扫码选项(当PDA设备能通过广播进行设置的时候可用)
    const rows = [{key: 'barcode_send_mode', value: 'BROADCAST'}];
    IdataScanner.setBroadcastSetting(
      'com.android.scanner.service_settings',
      rows,
    );

    //广播和接收字段(接收的广播名和接收的字段名)
    IdataScanner.getCode('android.intent.action.SCANRESULT', 'value');
    if (this.eventListener) {
      this.eventListener.remove();
    }
    const eventEmitter = new NativeEventEmitter();
    this.eventListener = eventEmitter.addListener(
      'scannerCodeShow',
      ({code}) => {
        this.setState({QRcode: code});
        ToastAndroid.show(`扫码成功: ${code}`, ToastAndroid.SHORT);
        this.handleQuery();
      },
    );
  }

  renderMedicineList() {
    return (
      <View>
        <View style={styles.content}>
          <Text style={styles.contentHeader}>
            {this.state.medicineInfo.name}
          </Text>
          <View style={styles.barcodeBox}>
            <Text style={styles.ordersTitle}>规格:</Text>
            <Text style={styles.ordersTitle}>
              {this.state.medicineInfo.standard}
            </Text>
          </View>
          <View style={styles.barcodeBox}>
            <Text style={styles.ordersTitle}>条码:</Text>
            <Text style={styles.ordersTitle}>
              {this.state.medicineInfo.barcode}
            </Text>
          </View>
          <View style={styles.barcodeBox}>
            <Text style={styles.ordersTitle}>货位：</Text>
            <Text style={styles.ordersTitle}></Text>
          </View>
          <View style={styles.barcodeBox}>
            <Text style={styles.ordersTitle}>库存:</Text>
            <Text style={styles.ordersTitle}>
              {this.state.medicineInfo.stock}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  handleQuery() {
    EasyLoading.show('查询中', 2000);
    let code = this.state.QRcode;
    getData('goods/search?barcode=' + code).then(res => {
      EasyLoading.dismiss();
      if (res.code != 200) {
        return this.setState({queryFlag: true, medicineInfo: {}, show: false});
      }
      this.setState({
        medicineInfo: res.data,
        show: true,
        queryFlag: false,
      });
    });
  }

  componentWillUnmount() {
    if (this.eventListener) {
      this.eventListener.remove(); // 组件卸载时记得移除监听事件
    }
  }

  render() {
    return (
      <View>
        <Loading type={'type'} loadingStyle={{backgroundColor: '#f007'}} />
        <View>
          <View style={styles.barcodeBox}>
            <MaterialCommunityIcons
              style={styles.orderIcon}
              name="barcode-scan"
              color={'#02A7F0'}
              size={30}></MaterialCommunityIcons>
            <Text style={styles.barcode}>{this.state.QRcode}</Text>
            <Feather
              style={styles.searchIcon}
              name="search"
              color={'#02A7F0'}
              size={30}></Feather>
          </View>
        </View>
        <ScrollView style={this.state.show ? styles.scrollBox : styles.none}>
          {this.renderMedicineList()}
        </ScrollView>
        <View style={this.state.queryFlag ? styles.failBox : styles.none}>
          <Image
            style={styles.failBoxImg}
            source={require('../../static/img/em.png')}></Image>
          <Text style={styles.failBoxTips}>查询失败</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  none: {
    display: 'none',
  },

  failBox: {
    width: scaleSizeW(650),
    marginLeft: scaleSizeW(50),
    marginTop: scaleSizeH(100),
    backgroundColor: '#fff',
    borderRadius: 10,
  },

  failBoxImg: {
    margin: scaleSizeW(75),
    width: scaleSizeW(500),
  },

  failBoxTips: {
    textAlign: 'center',
    fontSize: setSpText(32),
    color: 'red',
    paddingBottom: scaleSizeH(20),
  },

  barcodeBox: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: scaleSizeW(20),
    marginLeft: scaleSizeW(20),
  },

  orderIcon: {
    marginTop: scaleSizeW(14),
  },

  barcode: {
    borderColor: '#999',
    borderWidth: 1,
    height: scaleSizeW(80),
    width: scaleSizeW(560),
    marginLeft: scaleSizeW(20),
    padding: scaleSizeW(22),
  },

  searchIcon: {
    marginLeft: scaleSizeW(10),
    marginTop: scaleSizeW(14),
  },

  content: {
    borderBottomColor: '#999999',
    borderBottomWidth: 1,
    paddingBottom: scaleSizeW(20),
  },

  contentHeader: {
    fontWeight: 'bold',
    fontSize: setSpText(32),
    paddingLeft: scaleSizeW(40),
    paddingTop: scaleSizeW(20),
    color: '#333',
  },

  ordersTitle: {
    color: '#333',
    fontSize: setSpText(30),
    paddingLeft: scaleSizeW(20),
  },

  specification: {
    color: '#333',
    fontSize: setSpText(30),
    paddingLeft: scaleSizeW(20),
    width: scaleSizeW(460),
  },
});
