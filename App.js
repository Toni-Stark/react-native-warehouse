/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Button, Text} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import Index from './src/index/index';
import Login from './src/login/login';
import SetUrl from './src/login/setUrl';
import OrderInquiry from './src/order/orderInquiry';
import DrugChecking from './src/check/drugChecking';
import QueryDrugs from './src/query/queryDrugs';
import GoodsWarehousing from './src/warehousing/goodsWarehousing';
import Shipment from './src/shipment/shipment';

const Stack = createNativeStackNavigator();

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Index"
            component={Index}
            options={({navigation}) => ({
              headerStyle: {backgroundColor: '#353FA6'},
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              title: '药房门店智能管家',
              headerRight: () => (
                <Button
                  title="退出"
                  onPress={() => {
                    AsyncStorage.clear();
                    navigation.push('Login');
                  }}
                />
              ),
            })}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={({navigation}) => ({
              headerStyle: {backgroundColor: '#353FA6'},
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              title: '登录',
              headerLeft: () => <Text style={{display: 'none'}} />,
              headerRight: () => (
                <Button
                  title="设置"
                  onPress={() => {
                    navigation.push('SetUrl');
                  }}
                />
              ),
            })}
          />
          <Stack.Screen
            name="OrderInquiry"
            component={OrderInquiry}
            options={{
              headerStyle: {backgroundColor: '#353FA6'},
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              title: '订单查询',
            }}
          />
          <Stack.Screen
            name="Shipment"
            component={Shipment}
            options={{
              headerStyle: {backgroundColor: '#353FA6'},
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              title: '出库验货',
            }}
          />
          <Stack.Screen
            name="DrugChecking"
            component={DrugChecking}
            options={{
              headerStyle: {backgroundColor: '#353FA6'},
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              title: '商品盘点',
            }}
          />
          <Stack.Screen
            name="QueryDrugs"
            component={QueryDrugs}
            options={{
              headerStyle: {backgroundColor: '#353FA6'},
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              title: '商品查询',
            }}
          />
          <Stack.Screen
            name="GoodsWarehousing"
            component={GoodsWarehousing}
            options={{
              headerStyle: {backgroundColor: '#353FA6'},
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              title: '商品入库',
            }}
          />
          <Stack.Screen
            name="SetUrl"
            component={SetUrl}
            options={{
              headerStyle: {backgroundColor: '#353FA6'},
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              title: '设置网关',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
