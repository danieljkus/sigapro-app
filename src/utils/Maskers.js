import VMasker from 'vanilla-masker';

export const maskCPF = (text) => {
    return VMasker.toPattern(text, '999.999.999-99');
}

export const maskDate = (text) => {
    return VMasker.toPattern(text, '99/99/9999');
}

export const maskValorMoeda = (text) => {
    return parseFloat(text).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
    // return VMasker.toMoney(text, '0,000.00');
}
