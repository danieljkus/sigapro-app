import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-community/async-storage';

const PROF_COOKIE_NAME = 'x-access-token';

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

export const getPermissoes = async () => {
    const token = await getToken();
    return token ? jwtDecode(token).permissoes : null;
}

