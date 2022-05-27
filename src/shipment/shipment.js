import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  NativeEventEmitter,
  ToastAndroid,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import IdataScanner from 'react-native-idata-scanner';

import {getData} from '../../common/request';
import {scaleSizeH, scaleSizeW, setSpText} from '../../common/shepei';
import {EasyLoading, Loading} from '../../common/Loading';
import FixedButtonBottom from '../component/fixedButtonBottom';

export default class Shipment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      medicineList: [],
      orderInfo: {},
      QRcode: '请扫描货物条形码新增商品',
      orderTime: '',
      show: false,
      queryFlag: false,
      errorMessage: '',
      UnsettledOrder: true,
      UnsettledList: [],
      showModal: false,
      code96: '',
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
        if (
          !code.match(/69/) ||
          (code.match(/69/) && code.match(/69/).index !== 0)
        ) {
          this.handleQuery(code);
          this.setState({QRcode: code, errorMessage: ''});
        } else {
          this.verifyInventory(code);
          this.setState({code96: code, errorMessage: ''});
        }
        ToastAndroid.show(`扫码成功: ${code}`, ToastAndroid.SHORT);
      },
    );
  }

  componentWillUnmount() {
    if (this.eventListener) {
      this.eventListener.remove(); // 组件卸载时记得移除监听事件
    }
  }

  // 时间补零
  getTime(s) {
    return s < 10 ? '0' + s : s;
  }

  // 出货查询
  handleQuery(code) {
    EasyLoading.show('查询中', 2000);
    getData('order/search?type=1&barcode=' + code).then(res => {
      EasyLoading.dismiss();
      if (res.code != 200) {
        this.setState({
          queryFlag: true,
          orderInfo: {},
          medicineList: [],
          orderTime: '',
          errorMessage: res.msg,
          show: false,
        });
        return;
      }
      let time = new Date(res.data.created_time);
      let resDate =
        time.getFullYear() +
        '-' +
        this.getTime(time.getMonth() + 1) +
        '-' +
        this.getTime(time.getDate()) +
        ' ' +
        this.getTime(time.getHours()) +
        ':' +
        this.getTime(time.getMinutes()) +
        ':' +
        this.getTime(time.getSeconds());
      this.setState({
        orderInfo: res.data,
        medicineList: res.data.delivery_items,
        orderTime: resDate,
        show: true,
        queryFlag: false,
        UnsettledOrder: false,
        UnsettledList: [],
        showModal: false,
      });
    });
  }

  verifyInventory(code96) {
    let list = this.state.medicineList;
    let result = list.filter(item => item.product_number === code96)[0];
    if (!this.state.UnsettledOrder && result) {
      if (
        this.state.UnsettledList.find(
          item => result.product_number === item.number,
        ) === undefined
      ) {
        let data = [
          ...this.state.UnsettledList,
          {count: 1, number: result.product_number},
        ];
        if (data.length === list.length) {
          this.setState({
            showModal: true,
            UnsettledOrder: false,
            UnsettledList: [...data],
          });
        } else {
          this.setState({
            showModal: true,
            UnsettledOrder: false,
            UnsettledList: [...data],
          });
        }
      } else {
        let data = this.state.UnsettledList.filter(
          item => item.number === result.product_number,
        );
        if (data) {
          data[0].count = data[0].count + 1;
          if (data.length === list.length) {
            this.setState({
              showModal: true,
              UnsettledOrder: false,
              UnsettledList: [...data],
            });
          }
        }
      }
    } else if (this.state.UnsettledOrder) {
      EasyLoading.show('验货中', 2000);
      getData('order/search?type=1&barcode=' + code96).then(res => {
        EasyLoading.dismiss();
        if (res.code != 200) {
          this.setState({
            queryFlag: true,
            orderInfo: {},
            medicineList: [],
            orderTime: '',
            errorMessage: res.msg,
            show: false,
          });
          return;
        }
        let time = new Date(res.data.created_time);
        let resDate =
          time.getFullYear() +
          '-' +
          this.getTime(time.getMonth() + 1) +
          '-' +
          this.getTime(time.getDate()) +
          ' ' +
          this.getTime(time.getHours()) +
          ':' +
          this.getTime(time.getMinutes()) +
          ':' +
          this.getTime(time.getSeconds());
        this.setState({
          orderInfo: res.data,
          medicineList: res.data.delivery_items,
          orderTime: resDate,
          show: true,
          queryFlag: false,
          UnsettledOrder: false,
          UnsettledList: [],
          showModal: false,
        });
      });
    }
  }

  getForm() {
    this.setState({
      medicineList: [],
      orderInfo: {},
      QRcode: '请扫描货物条形码新增商品',
      UnsettledOrder: true,
      UnsettledList: [],
      showModal: false,
      code96: '',
      orderTime: '',
      show: false,
      queryFlag: false,
    });
  }

  // 渲染药品列表
  renderMedicineList() {
    let that = this;
    return (
      <View>
        {that.state.medicineList?.map(function (item, index) {
          let isVerified = false;
          let isSuccess = false;
          let list = that.state.UnsettledList.find(
            itam => itam.number === item.product_number,
          );
          if (list) {
            isVerified = true;
            if (list.count === item.goods_count) {
              isSuccess = true;
            }
          }
          return (
            <View key={index}>
              <View
                style={[
                  styles.content,
                  isVerified
                    ? isSuccess
                      ? styles.successBgGreen
                      : styles.successBgPink
                    : '',
                ]}>
                <Text style={styles.contentHeader}>{item.goods_name}</Text>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>剂型:</Text>
                  <Text style={styles.ordersContent}>{item.torch}</Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>69码:</Text>
                  <Text style={styles.ordersContent}>
                    {item.product_number}
                  </Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>商品编码:</Text>
                  <Text style={styles.ordersContent}>{item.erp_id}</Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>数量:</Text>
                  <Text style={styles.ordersContent}>{item.goods_count}</Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>生产批号:</Text>
                  <Text style={styles.ordersContent}>{item.batchno}</Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>规格:</Text>
                  <Text style={styles.ordersContent}>{item.standard}</Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>批次号:</Text>
                  <Text style={styles.ordersContent}>{item.makeno}</Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>国字准号:</Text>
                  <Text style={styles.ordersContent}>
                    {item.authorized_code}
                  </Text>
                </View>
                <View style={styles.barcodeBox}>
                  <Text style={styles.ordersTitle}>药厂:</Text>
                  <Text style={styles.ordersContent}>
                    {item.product_merchant}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  render() {
    let info = this.state.orderInfo;
    return (
      <View style={{flex: 1}}>
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

        <ScrollView
          style={[this.state.show ? '' : styles.none, styles.scrollView]}>
          {/*订单号: {this.state.QRcode}*/}
          <View style={styles.orders}>
            <View style={styles.barcodeBox}>
              <Text style={styles.ordersTitle}>下单时间:</Text>
              <Text style={styles.ordersContent}>{this.state.orderTime}</Text>
            </View>
            <View style={styles.barcodeBox}>
              <Text style={styles.ordersTitle}>下单平台:</Text>
              <Text style={styles.ordersContent}>{info.platform}</Text>
            </View>
            <View style={styles.barcodeBox}>
              <Text style={styles.ordersTitle}>收件人:</Text>
              <Text style={styles.ordersContent}>
                {info.receiver_name} {info.receiver_mobile}
              </Text>
            </View>
          </View>
          <View style={styles.scrollBox}>{this.renderMedicineList()}</View>
        </ScrollView>
        <View style={this.state.queryFlag ? styles.failBox : styles.none}>
          <Image
            style={styles.failBoxImg}
            source={require('../../static/img/em.png')}></Image>
          <Text style={styles.failBoxTips}>
            {this.state.errorMessage || '查询失败'}
          </Text>
        </View>
        <View style={[this.state.show ? styles.none : '', {flex: 1}]}></View>
        <FixedButtonBottom
          name="确定验货"
          onPress={() => {
            this.getForm();
          }}
          visible={this.state.showModal}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  none: {display: 'none'},
  successBgPink: {
    backgroundColor: 'pink',
  },
  successBgGreen: {
    backgroundColor: 'green',
  },
  scrollView: {
    flex: 1,
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

  logistics: {
    marginLeft: scaleSizeW(30),
    padding: scaleSizeW(2),
  },

  orders: {
    borderBottomColor: '#999999',
    borderBottomWidth: 1,
    borderTopColor: '#999999',
    borderTopWidth: 1,
    paddingBottom: scaleSizeW(20),
    marginTop: scaleSizeW(18),
  },

  ordersTitle: {
    color: '#333',
    fontSize: setSpText(30),
    paddingLeft: scaleSizeW(20),
    width: scaleSizeW(160),
  },

  ordersContent: {
    color: '#333',
    fontSize: setSpText(30),
    width: scaleSizeW(540),
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

  scrollBox: {
    paddingBottom: scaleSizeW(200),
  },
});
