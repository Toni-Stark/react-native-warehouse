import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  NativeEventEmitter,
  ToastAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {Button} from 'react-native-elements';
import IdataScanner from 'react-native-idata-scanner';

import {scaleSizeH, scaleSizeW, setSpText} from './../../common/shepei';
import {getData, postData} from '../../common/request';
import {EasyLoading, Loading} from './../../common/Loading.js';
export default class DrugChecking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      medicineList: [],
      barcodeList: [],
      QRcode: '请扫描货物条形码新增商品',
      loading: false,
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

  componentWillUnmount() {
    if (this.eventListener) {
      this.eventListener.remove(); // 组件卸载时记得移除监听事件
    }
  }

  handleQuery() {
    let code = this.state.QRcode;
    if (this.state.barcodeList.includes(code)) {
      const medicine = [...this.state.medicineList];
      return this.setState({
        medicineList: medicine.map((item, idx) =>
          code == item.barcode
            ? {...item, stock: this.state.medicineList[idx].stock + 1}
            : item,
        ),
      });
    } else {
      EasyLoading.show('查询中', 2000);
      getData('goods/search?barcode=' + code).then(res => {
        EasyLoading.dismiss();
        if (res.code != 200) {
          return ToastAndroid.showWithGravity(
            '查询失败',
            2000,
            ToastAndroid.SHORT,
          );
        }
        let obj = res.data;
        obj.stock = 1;
        let arr = this.state.medicineList.concat(obj);
        this.setState({
          medicineList: arr,
          barcodeList: this.state.barcodeList.concat(code),
        });
      });
    }
  }

  async handleSumbit() {
    var arr = [];
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      this.setState({loading: false});
    }, 2000);
    this.state.medicineList.map(item => {
      let obj = {
        goods_id: item.id,
        number: item.stock,
      };
      arr.push(obj);
    });
    let params = {
      goods: arr,
    };
    if (arr.length < 1) {
      return ToastAndroid.showWithGravity(
        '请盘点商品后提交！',
        2000,
        ToastAndroid.SHORT,
      );
    }
    postData('goods/check', JSON.stringify(params)).then(res => {
      if (res.code != 200) {
        return ToastAndroid.showWithGravity(
          '盘点失败！',
          2000,
          ToastAndroid.SHORT,
        );
      }
      ToastAndroid.showWithGravity('盘点成功！', 2000, ToastAndroid.SHORT);
      setTimeout(() => {
        this.props.navigation.goBack();
      }, 2000);
    });
  }

  renderMedicineList() {
    let that = this;
    return (
      <View>
        {that.state.medicineList.map(function (item, index) {
          return (
            <View key={index}>
              <View style={styles.content}>
                <Text style={styles.contentHeader}>{item.name}</Text>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>规格:</Text>
                  <Text style={styles.specification}>{item.standard}</Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>条码:</Text>
                  <Text style={styles.ordersTitle}>{item.barcode}</Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>货位:</Text>
                  <Text style={styles.ordersTitle}>{item.allocation}</Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersCount}>数量:</Text>
                  <Text style={styles.ordersInput}>{item.stock}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  render() {
    return (
      <View style={styles.wrap}>
        <Loading type={'type'} loadingStyle={{backgroundColor: '#f007'}} />
        <ScrollView>
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
          <View>{this.renderMedicineList()}</View>
        </ScrollView>
        <View style={this.state.medicineList.length > 0 ? '' : styles.none}>
          <Button
            title="提交盘点"
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: scaleSizeW(10),
    flex: 1,
  },

  none: {
    display: 'none',
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

  searchIcon: {
    marginLeft: scaleSizeW(10),
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

  ordersTitle: {
    color: '#333',
    fontSize: setSpText(30),
    paddingLeft: scaleSizeW(20),
  },

  ordersInput: {
    borderColor: '#999',
    borderWidth: 1,
    paddingLeft: scaleSizeW(10),
    width: scaleSizeW(560),
    height: scaleSizeW(70),
    marginLeft: scaleSizeW(20),
    paddingTop: scaleSizeW(18),
    color: 'red',
  },

  ordersCount: {
    height: scaleSizeW(70),
    paddingTop: scaleSizeW(14),
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
});
