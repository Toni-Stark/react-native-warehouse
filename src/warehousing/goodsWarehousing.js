import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, NativeEventEmitter, ToastAndroid } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalDropdown from 'react-native-modal-dropdown';
import { Button } from 'react-native-elements';
import IdataScanner from 'react-native-idata-scanner';

import { getData, postData } from './../../common/request'
import { scaleSizeH, scaleSizeW, setSpText } from './../../common/shepei';
import { EasyLoading, Loading } from './../../common/Loading.js'

export default class GoodsWarehousing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            medicine: [],
            list: ['采购', '采购1', '采购2', '采购3', '采购4', '采购5', '采购6', '采购7'],
            list1: ['采购', '采购1', '采购2', '采购3', '采购4', '采购5', '采购6', '采购7'],
            QRcode: '请扫描货物条形码新增商品',
            remark: '',
            count: 0,
            barcodeList: [],
            loading: false
        }
    }

    componentDidMount() {
        this.registePdaEvent()
    }


    handleQuery() {
        let code = this.state.QRcode
        if (this.state.barcodeList.includes(code)) {
            const medicine = [...this.state.medicine];
            this.setState({
                medicine: medicine.map((item, idx) => code == item.barcode ? { ...item, stock: this.state.medicine[idx].stock + 1 } : item),
                count: this.state.count + 1
            })
        } else {
            EasyLoading.show('查询中', 2000)
            getData('goods/search?barcode=' + code).then(res => {
                EasyLoading.dismiss()
                if (res.code != 200) {
                    return ToastAndroid.showWithGravity('查询失败', 2000, ToastAndroid.SHORT,);
                }
                let obj = res.data
                obj.stock = 1
                let arr = this.state.medicine.concat(obj)
                this.setState({
                    medicine: arr,
                    barcodeList: this.state.barcodeList.concat(code),
                    count: this.state.count + 1
                })
            })
        }
    }

    registePdaEvent() {
        //设置扫码选项(当PDA设备能通过广播进行设置的时候可用)
        const rows = [{ key: 'barcode_send_mode', value: 'BROADCAST' }];
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
            ({ code }) => {
                this.setState({ QRcode: code });
                ToastAndroid.show(`扫码成功: ${code}`, ToastAndroid.SHORT);
                this.handleQuery()
            },
        );
    }


    componentWillUnmount() {
        if (this.eventListener) {
            this.eventListener.remove(); // 组件卸载时记得移除监听事件
        }
    }

    // 选中下拉框
    handleReason(idx, value) {
        console.log(idx, '...idx...')
        console.log(value, '...value...')
    }

    // 输入框
    handleInput(e) {
        this.setState({
            remark: e
        })
    }

    // 提交
    async handleSumbit() {
        this.setState({
            loading: true
        })
        setTimeout(() => { this.setState({ loading: false }) }, 2000)
        var arr = []
        this.state.medicine.map((item) => {
            let obj = {
                goods_id: item.id,
                number: item.stock,
                rack_type: 1
            }
            arr.push(obj)
        })
        if (arr.length < 1) {
            return ToastAndroid.showWithGravity('请扫码后提交商品！', 2000, ToastAndroid.SHORT,);
        }
        let params = {
            goods: arr,
            note: this.state.remark,
            reason_type: 1,
        }
        let obj = JSON.stringify(params)
        postData('goods/storage', obj).then(res => {
            if (res.code != 200) {
                return ToastAndroid.showWithGravity('入库失败！', 2000, ToastAndroid.SHORT,);
            }
            ToastAndroid.showWithGravity('入库成功！', 2000, ToastAndroid.SHORT,);
            setTimeout(() => { this.props.navigation.goBack() }, 2000)
        })
    }


    render() {
        let that = this
        return (
            <View style={styles.wrap}>
                <Loading type={"type"} loadingStyle={{ backgroundColor: "#f007" }} />
                <ScrollView>
                    <View>
                        <View style={styles.goodsHeader}>
                            <Text style={styles.headerText}>当前仓库</Text>
                            <Text style={styles.headerText}>电商库</Text>
                        </View>
                        <View style={styles.spaceBetween}>
                            <Text style={styles.headerTitle}>入库原因</Text>
                            <ModalDropdown style={styles.dropDown}
                                textStyle={styles.dropDownText}
                                dropdownStyle={styles.dropDownList}
                                options={this.state.list} onSelect={(idx, value) => this.handleReason(idx, value)} defaultValue='请选择入库原因' />

                        </View>
                        <View style={styles.spaceBetween}>
                            <Text style={styles.headerTitle}>备注</Text>
                            <TextInput style={styles.headerInput} onChangeText={(text) => this.handleInput(text)} placeholder='请填写备注，如无可不填写'></TextInput>
                        </View>
                    </View>
                    <View>
                        <View style={styles.goodSelect}>
                            <Text style={styles.headerText}>选择货物</Text>
                            <Text style={styles.headerText}>入库量：{that.state.count}</Text>
                        </View>
                        <View style={styles.barcodeBox}>
                            <MaterialCommunityIcons style={styles.orderIcon} name='barcode-scan' color={'#02A7F0'} size={30}></MaterialCommunityIcons>
                            <Text style={styles.barcode}>{this.state.QRcode}</Text>
                        </View>
                        {
                            that.state.medicine.map(function (item, index) {
                                return (
                                    <View key={index}>
                                        <View style={styles.content}>
                                            <Text style={styles.contentHeader}>{item.name}</Text>
                                            <View style={styles.barcodeBox}>
                                                <Text style={styles.ordersTitle}>规格:</Text>
                                                <Text style={styles.specification}>{item.standard}</Text>
                                                {/* <Text style={styles.ordersTitle}>单位：盒</Text> */}
                                            </View>
                                            <View style={styles.barcodeBox}>
                                                <Text style={styles.ordersTitle}>条码:</Text>
                                                <Text style={styles.ordersTitle}>{item.barcode}</Text>
                                            </View>
                                            <View style={styles.barcodeBox}>
                                                <Text style={styles.headerTitle}>货位:</Text>
                                                <ModalDropdown style={styles.dropDown_2}
                                                    textStyle={styles.dropDownText}
                                                    dropdownStyle={styles.dropDownList}
                                                    options={that.state.list} defaultValue='请选择货位' />
                                            </View>
                                            <View style={styles.barcodeBox}>
                                                <Text style={styles.ordersCount}>数量:</Text>
                                                <Text style={styles.ordersInput}>{item.stock}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })
                        }

                    </View>
                </ScrollView>
                <View style={this.state.medicine.length > 0 ? '' : styles.none}>
                    <Button
                        title="提交入库"
                        loading={this.state.loading}
                        titleStyle={{ fontWeight: '700' }}
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
        )
    }
}

const styles = StyleSheet.create({
    none: {
        display: 'none'
    },

    wrap: {
        paddingBottom: scaleSizeW(10),
        flex: 1
    },

    goodsHeader: {
        display: 'flex',
        flexDirection: 'row',
        padding: scaleSizeW(24),
        justifyContent: 'space-between',
        borderBottomColor: '#999',
        borderBottomWidth: 1,
    },

    dropDown: {
        width: scaleSizeW(560),
        textAlign: 'right',
        borderColor: '#999',
        borderWidth: 1,
        padding: scaleSizeW(10)
    },

    dropDown_2: {
        width: scaleSizeW(560),
        textAlign: 'right',
        borderColor: '#999',
        borderWidth: 1,
        padding: scaleSizeW(10),
        marginLeft: scaleSizeW(20)
    },

    dropDownText: {
        color: '#333',
        fontSize: setSpText(30),
        textAlign: 'right',
        padding: scaleSizeW(5)
    },

    dropDownList: {
        width: scaleSizeW(560),
    },

    spaceBetween: {
        display: 'flex',
        flexDirection: 'row',
        padding: scaleSizeW(10),
        justifyContent: 'space-between',
        borderBottomColor: '#999',
        borderBottomWidth: 1,
    },

    headerText: {
        color: '#333',
        fontSize: setSpText(32)
    },

    headerTitle: {
        marginLeft: scaleSizeW(20),
        color: '#333',
        fontSize: setSpText(30),
        paddingTop: scaleSizeW(14),
    },

    headerInput: {
        borderColor: '#999',
        borderWidth: 1,
        height: scaleSizeW(70),
        width: scaleSizeW(560),
        marginLeft: scaleSizeW(20),
        paddingLeft: scaleSizeW(10)
    },

    goodSelect: {
        display: 'flex',
        flexDirection: 'row',
        padding: scaleSizeW(26),
        justifyContent: 'space-between',
        backgroundColor: '#ddd'
    },

    barcodeBox: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: scaleSizeW(20),
        marginLeft: scaleSizeW(20)
    },

    orderIcon: {
        marginTop: scaleSizeW(14)
    },

    barcode: {
        borderColor: '#999',
        borderWidth: 1,
        padding: scaleSizeW(20),
        width: scaleSizeW(640),
        marginLeft: scaleSizeW(20),

    },

    content: {
        borderBottomColor: '#999999',
        borderBottomWidth: 1,
        paddingBottom: scaleSizeW(20),
    },

    contentHeader: {
        fontWeight: 'bold',
        fontSize: setSpText(34),
        paddingLeft: scaleSizeW(40),
        paddingTop: scaleSizeW(20),
        color: '#333'
    },

    ordersTitle: {
        color: '#333',
        fontSize: setSpText(30),
        paddingLeft: scaleSizeW(20)
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
        width: scaleSizeW(460)
    },

    ordersInput: {
        borderColor: '#999',
        borderWidth: 1,
        paddingLeft: scaleSizeW(10),
        paddingTop: scaleSizeW(16),
        width: scaleSizeW(560),
        height: scaleSizeW(70),
        marginLeft: scaleSizeW(20)
    },
})
