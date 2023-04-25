import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-community/async-storage';

const PROF_COOKIE_NAME = 'SIGAPRO';

export const saveToken = async (token) => {
    await AsyncStorage.setItem(PROF_COOKIE_NAME, token);
}

export const saveSenha = async (senha) => {
    await AsyncStorage.setItem('SIGAPRO-access-token-senha', senha);
}

export const saveUsuario = async (usuario) => {
    await AsyncStorage.setItem('SIGAPRO-access-token-usuario', usuario);
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

export const getSenha = async () => {
    return await AsyncStorage.getItem('SIGAPRO-access-token-senha');
}

export const getUsuarioAux = async () => {
    return await AsyncStorage.getItem('SIGAPRO-access-token-usuario');
}

export const getFilial = async () => {
    const token = await getToken();
    return token ? jwtDecode(token).filial : null;
}

export const getGrupoPerm = async () => {
    const token = await getToken();
    return token ? jwtDecode(token).grupo : null;
}




export const getTemPermissao = (permissao, permissoes) => {
    // console.log('getTemPermissao: ', permissao);
    // console.log('getTemPermissao: ', permissoes);

    let iIndItem = -1;
    if ((permissoes) && (permissoes.length > 0) && (permissao)) {
        // console.log('getTemPermissao: ', permissoes);
        // const iIndItem = permissoes.findIndex(registro => (registro.adm_fsp_nome).trim().toUpperCase === (permissao).trim().toUpperCase);

        for (var x in permissoes) {
            if (permissoes[x].adm_fsp_nome === permissao) {
                iIndItem = x;
            }
        };

        // console.log('getTemPermissao: ', permissao + ' - ' + (iIndItem >= 0 ? true : false));
        // console.log('getTemPermissao: ', permissao + ' - ' + iIndItem);
        return iIndItem >= 0 ? 1 : 0;
    } else {
        // return false;
    }
}

export const removePermissoes = async () => {
    await AsyncStorage.removeItem(PROF_COOKIE_NAME + '-permissoes');
}




