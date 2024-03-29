import TextInput from '../components/TextInput';

export const validateEmail = (value) => {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(value);
}

export const validateSenha = (value) => {
    return !!value && value.length >= 1 && value.length <= 20;
}

export const validateCPF = (value = '') => {
    const cpf = value.replace(/[^0-9]/g, '');
    return !!cpf && cpf.length === 11;
}

export const checkFormIsValid = (refs) => {
    return Object.keys(refs)
        .map(ref => refs[ref])
        .filter(element => element instanceof TextInput)
        .reduce(((previousValid, input) => {
            return input.isValid() && previousValid;
        }), true)
}