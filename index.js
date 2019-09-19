import { AppRegistry, YellowBox } from 'react-native';
import App from './src/App';

import axios from 'axios';

import { getToken } from './src/utils/LoginManager';

if (__DEV__) {
    // axios.defaults.baseURL = 'https://cargasweb.expnordeste.com.br/api/';
    axios.defaults.baseURL = 'http://10.0.1.9/siga-web3-back/public/api';
} else {
    axios.defaults.baseURL = 'https://cargasweb.expnordeste.com.br/api/';
}

axios.interceptors.request.use(async (request) => {
    const token = await getToken();
    request.headers.Authorization = `Bearer ${token}`;
    return request;
})

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

AppRegistry.registerComponent('SIGAPRO', () => App);
