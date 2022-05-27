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

import {getData} from './../../common/request';
import {scaleSizeH, scaleSizeW, setSpText} from './../../common/shepei';
import {EasyLoading, Loading} from './../../common/Loading.js';
import FormItem from '../component/formItem';

export default class OrderInquiry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deliveryItems: [],
      goodsItem: [],
      orderInfo: {},
      QRcode: '请扫描货物条形码新增商品',
      orderTime: '',
      show: false,
      queryFlag: false,
      errorMessage: '',
    };
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
        this.setState({QRcode: code, errorMessage: ''});
        ToastAndroid.show(`扫码成功: ${code}`, ToastAndroid.SHORT);
        this.handleQuery();
      },
    );
  }

  componentDidMount() {
    this.registePdaEvent();
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

  // 订单查询
  handleQuery() {
    EasyLoading.show('查询中', 2000);
    let code = this.state.QRcode;
    getData('order/search?type=2&barcode=' + code).then(res => {
      EasyLoading.dismiss();
      if (res.code != 200) {
        this.setState({
          queryFlag: true,
          orderInfo: {},
          deliveryItems: [],
          goodsItems: [],
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
        deliveryItems: res.data.delivery_items,
        goodsItems: res.data.goods_items,
        orderTime: resDate,
        show: true,
        queryFlag: false,
      });
    });
  }

  // 渲染药品列表
  renderMedicineList() {
    let that = this;
    return (
      <View>
        {that.state.deliveryItems?.map(function (item, index) {
          return (
            <View key={index}>
              <View style={styles.content}>
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

  renderGoodsItems() {
    return (
      <View style={styles.ItemsBox}>
        <View style={styles.ItemsBoxView}>
          <Text style={styles.ItemsBoxTitle}>商品列表</Text>
        </View>
        <View style={styles.DataCardList}>
          {this.state.goodsItems?.map((item, index) => {
            return (
              <View
                key={index}
                style={[styles.DataCardItem, index && styles.borderTopBox]}>
                <FormItem name="商品名称" message={item.title} />
                <FormItem name="规格" message={item.spec} />
                <FormItem name="商品编号" message={item.erp_id} />
                <FormItem name="商品价格" message={item.price} />
                <FormItem name="商品数量" message={item.quantity} />
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  renderDeliveryItems() {
    return (
      <View style={styles.ItemsBox}>
        <View style={styles.ItemsBoxView}>
          <Text style={styles.ItemsBoxTitle}>下账信息</Text>
        </View>
        <View style={styles.DataCardList}>
          {this.state.deliveryItems?.map((item, index) => {
            return (
              <View key={index} style={styles.DataCardItem}>
                <FormItem name="名称" message={item.goods_name} />
                <FormItem name="商品编码" message={item.erp_id} />
                <FormItem name="生产批号" message={item.batchno} />
                <FormItem name="批次号" message={item.makeno} />
                <FormItem name="剂型" message={item.torch} />
                <FormItem name="69码" message={item.product_number} />
                <FormItem name="国字准号" message={item.authorized_code} />
                <FormItem name="药厂" message={item.product_merchant} />
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  render() {
    let info = this.state.orderInfo;
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

        <ScrollView
          style={[this.state.show ? '' : styles.none, styles.scrollStyle]}>
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
          <View style={styles.scrollTable}>{this.renderGoodsItems()}</View>
          <View style={styles.scrollTable}>{this.renderDeliveryItems()}</View>
        </ScrollView>
        <View style={this.state.queryFlag ? styles.failBox : styles.none}>
          <Image
            style={styles.failBoxImg}
            source={require('../../static/img/em.png')}></Image>
          <Text style={styles.failBoxTips}>
            {this.state.errorMessage || '查询失败'}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  none: {display: 'none'},
  scrollStyle: {
    marginBottom: scaleSizeW(150),
  },
  borderTopBox: {
    borderTopWidth: 1,
    borderColor: '#dedede',
    paddingTop: scaleSizeW(25),
    marginTop: scaleSizeW(15),
    paddingBottom: scaleSizeW(15),
    borderStyle: 'solid',
  },

  DataCardList: {
    flex: 1,
    margin: scaleSizeW(15),
    marginTop: 0,
    paddingTop: scaleSizeW(15),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(138,138,138,0.93)',
    borderStyle: 'solid',
  },

  DataCardItem: {
    display: 'flex',
    paddingLeft: scaleSizeW(20),
    paddingRight: scaleSizeW(20),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  ItemsBoxView: {
    marginTop: scaleSizeW(15),
    marginLeft: scaleSizeW(15),
    marginRight: scaleSizeW(15),
    paddingLeft: scaleSizeW(10),
    paddingRight: scaleSizeW(10),
    paddingTop: scaleSizeW(15),
    paddingBottom: scaleSizeW(15),
    borderWidth: 1,
    borderColor: 'rgba(138,138,138,0.93)',
    borderStyle: 'solid',
    borderBottomWidth: 0,
    backgroundColor: 'rgba(229,227,227,0.85)',
  },
  ItemsBox: {
    marginTop: scaleSizeW(18),
  },

  ItemsBoxTitle: {
    marginLeft: scaleSizeW(10),
    color: '#000000',
    fontSize: setSpText(40),
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
});
