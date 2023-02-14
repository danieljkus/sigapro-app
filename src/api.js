// CREATED BY MAYK FELIX 14/02/2023
import axios from 'axios';

export const getListaRestaurantes = async (params = {}) => {
    return axios.get('/listaRestaurantes', {
        params: {
            ...params,
        },
    });
};

export const getListaRefeicoes = async (params = {}) => {
    return axios.get('/refeicoes', {
        params: {
            ...params,
        },
    });
};
