import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import {Alert} from 'react-native';

const instance = axios.create({
  // baseURL: 'http://192.168.10.241:10011/wap/7J6zvmx8Y',
  // baseURL: 'http://api.kmldrug.360zhishu.cn/wap/',
  baseURL: 'http://192.168.10.165:8888/wap/',
  timeout: 30000,
});

export async function api(apiPath, param) {
  var token = await AsyncStorage.getItem('token');
  if (token == undefined) {
    token = '';
  }
  param.data = param.data || {};
  return new Promise((resolve, reject) => {
    instance({
      url: apiPath,
      method: param.method || 'GET',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: token || '',
      },
      data: param.data,
    })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export async function postData(apiPath, param) {
  var token = await AsyncStorage.getItem('token');
  var url = await AsyncStorage.getItem('url');
  if (token == null) {
    token = '';
  }

  if (url == null) {
    url = 'http://api.drug.360zhishu.cn';
  }
  var hender = 'multipart/form-data';
  if (apiPath == 'goods/check' || apiPath == 'goods/storage') {
    hender = 'application/json';
    console.log(hender, '..header...');
  }
  const response = await fetch(url + '/wap/' + apiPath, {
    method: 'POST',
    headers: {
      'Content-Type': hender,
      Authorization: token,
    },
    body: param,
  });
  // Alert.alert(JSON.stringify(response))
  return response.json();
}

export async function getData(apiPath) {
  var token = await AsyncStorage.getItem('token');
  var url = await AsyncStorage.getItem('url');
  if (token === undefined) {
    token = '';
  }
  if (url == null) {
    url = 'http://api.drug.360zhishu.cn';
  }
  const response = await fetch(url + '/wap/' + apiPath, {
    method: 'GET',
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: token,
    },
  });
  console.log(response, '...get....');
  return response.json();
}
