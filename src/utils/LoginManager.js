import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-community/async-storage';

const PROF_COOKIE_NAME = 'SIGAPRO';

export const saveToken = async (token) => {
    await AsyncStorage.setItem(PROF_COOKIE_NAME, token);
}

export const getToken = async () => {
    return await AsyncStorage.getItem(PROF_COOKIE_NAME);
}

export const removeToken = async () => {
    await AsyncStorage.removeItem(PROF_COOKIE_NAME);
}

export const isLoggedIn = async () => {
    const token = await getToken();
    return !!token;
}



export const getTemPermissao = (permissao, permissoes) => {
    // getPermissoes().then(permissoes => {
        // this.setState({ permissoes });

        // console.log('getTemPermissao: ', permissao);
        // console.log('getTemPermissao: ', permissoes);

        if ((permissoes) && (permissoes.length > 0) && (permissao)) {
            // console.log('getTemPermissao: ', permissoes);
            const iIndItem = permissoes.findIndex(registro => registro.adm_fsp_nome === permissao);
            // console.log('getTemPermissao: ', permissao + ' - ' + (iIndItem >= 0 ? true : false));
            return iIndItem >= 0 ? 'S' : 'N';
        } else {
            // return false;
        }
    // })
}

export const removePermissoes = async () => {
    await AsyncStorage.removeItem(PROF_COOKIE_NAME + '-permissoes');
}




export const getPermissoes = async () => {
    const token = await getToken();
    return token ? jwtDecode(token).permissoes : null;
}

export const getUsuario = async () => {
    const token = await getToken();
    return token ? jwtDecode(token).usuario : null;
}

export const getTipoUsuario = async () => {
    const token = await getToken();
    return token ? jwtDecode(token).tipo : null;
}

export const getEmpresa = async () => {
    const token = await getToken();
    return token ? jwtDecode(token).empresa : null;
}

export const getFilial = async () => {
    const token = await getToken();
    return token ? jwtDecode(token).filial : null;
}

export const getGrupoPerm = async () => {
    const token = await getToken();
    return token ? jwtDecode(token).grupo : null;
}


