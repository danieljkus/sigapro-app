import {AppRegistry, YellowBox, LogBox} from 'react-native';
import './LegacyReact';
import App from './src/App';

import axios from 'axios';

import {getToken} from './src/utils/LoginManager';

if (__DEV__) {
    // axios.defaults.baseURL = 'https://189.112.171.123/api/';
    // axios.defaults.baseURL = 'http://sigapro.expnordeste.com.br/api/';
    axios.defaults.baseURL = 'https://sigapro.expnordeste.com.br/api/';
    // axios.defaults.baseURL = 'http://10.0.1.9/siga-web3-back/public/api';
} else {
    axios.defaults.baseURL = 'https://sigapro.expnordeste.com.br/api/';
}

axios.interceptors.request.use(async (request) => {
    const token = await getToken();
    request.headers.Authorization = `Bearer ${token}`;
    return request;
});

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

AppRegistry.registerComponent('SIGAPRO', () => App);
