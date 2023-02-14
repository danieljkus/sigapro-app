import axios from 'axios';
import AsyncStorage from "@react-native-community/async-storage";
import {getToken} from "./utils/LoginManager";


const request = {
    app: 'https://sigapro.expnordeste.com.br/api/',
};
const api = axios.create({
    baseURL: request.app,
});


export const getListaRestaurantes = async (params) => {
    const token = await getToken();

    console.log('token', token)
    return api.get('/listaRestaurantes', {
        params: {},
    });
};
