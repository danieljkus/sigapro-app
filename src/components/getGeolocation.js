// CREATED BY MAYK FELIX 14/02/2023
import {PermissionsAndroid} from "react-native";
import GetLocation from "react-native-get-location";

const PermissionsMyAndroid = async () => {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('permissão concedida');
        return false
    } else {
        console.log('a permissão de geolocalizacao foi negada');
        return true
    }
};

const PermissionsMyIos = async () => {
    const granted = await Permissions.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('permissão concedida');
        return false
    } else {
        console.log('a permissão de geolocalizacao foi negada');
        return true
    }
};


// VERIFICA SE A PERMISAO DE GEOLOCATION TA ATIVADA OU NEGADA
export async function verifyLocationPermission() {
    try {

        if (Platform.OS === 'android') {
            PermissionsMyAndroid();
        } else {
            PermissionsMyIos();
        }

    } catch (err) {
        return false
    }
}

// VERIFICA SE GPS TA ATIVO OU DESATIVADO
export async function verifyGeolocationActive() {
    let geolocation = false;
    await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
    }).then(location => {
        console.log('location', location);
        geolocation = false;
        return false; // // GPS ATIVADO
    }).catch(error => {
        const {code, message} = error;
        console.log(code, message);
        geolocation = true;
        return true; // GPS DESATIVADO OU DESCONHECIDO/INEXISTENTE
    });
    return geolocation;
}
