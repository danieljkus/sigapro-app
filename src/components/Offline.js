// CREATED BY MAYK FELIX 20/02/2023
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import NetInfo from "@react-native-community/netinfo";

// VAMOS VERIFICAR SE TA ONLINE OU OFFLINE E NOTIFICAR COM O DISPATH USANDO REDUX E CONTEXT
export const AppOffline = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        NetInfo.addEventListener(state => {
            onNetEvento(state)
        });
    }, []);

    const onNetEvento = (info) => {
        // OFFLINE
        if (!info?.isConnected) {
            dispatch({type: 'OPEN_SNACKBAR', isVisible: true, payload: 'Dispositivo sem conexão', duration: 7000});
        }
        // RECONNECTED
        if (!info?.isConnected && info?.isInternetReachable && info?.isConnected) {
            // dispatch({type: 'OPEN_SNACKBAR', isVisible: true, payload: 'Dispositivo reconnectado', duration: 7000});
        }
    };

    return null;
};

