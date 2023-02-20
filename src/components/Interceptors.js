// CREATED BY MAYK FELIX 20/02/2023
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import {getToken} from "../utils/LoginManager";

// VAMOS VERIFICAR SE TA ONLINE OU OFFLINE E NOTIFICAR COM O DISPATH USANDO REDUX E CONTEXT
export const Interceptors = () => {
    // const dispatch = useDispatch();
    //
    // useEffect(() => {
    //     NetInfo.addEventListener(state => {
    //         onNetEvento(state)
    //     });
    // }, []);
    //
    // const onNetEvento = (info) => {
    //     if (!info?.isConnected) {
    //         dispatch({type: 'OPEN_SNACKBAR', isVisible: true, payload: 'Dispositivo sem conexão', duration: 7000});
    //     }
    // };

    useEffect(() => {
        // axios.interceptors.request.use(async (request) => {
        // console.log('request', request)
        // const token = await getToken();
        // request.headers.Authorization = `Bearer ${token}`;
        // return request;
        // });
    });


    return null
};

