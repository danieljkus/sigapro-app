import VMasker from 'vanilla-masker';

export const maskCPF = (text) => {
    return VMasker.toPattern(text, '999.999.999-99');
}

export const maskCNPJ = (text) => {
    return VMasker.toPattern(text, '99.999.999/9999-99');
}

export const maskDate = (text) => {
    return VMasker.toPattern(text, '99/99/9999');
}

export const maskTelefone = (text) => {
    return VMasker.toPattern(text, '(99)99999-9999');
}

export const vlrMoedaDigitado = (newText, oldText) => {
    const decimalRegex = /^[+-]?([0-9]+([,][0-9]*)?|[,][0-9]+)$/;
    return !newText || decimalRegex.test(newText) ? newText : oldText;
    // return parseFloat(newText).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
}

export const vlrStringParaFloat = text => {
    // "6.123,09"
    if (typeof text !== 'string') return 0;

    const formatado = text
        .replace('.', '')
        .replace(',', '.');

    return parseFloat(formatado)
}

export const maskValorMoeda = numero => {
    if (typeof numero !== 'number') return '0,00';

    return VMasker.toMoney(parseFloat(numero).toFixed(2), {
        // Decimal precision -> "90"
        precision: 2,
        // Decimal separator -> ",90"
        separator: ',',
        // Number delimiter -> "12.345.678"
        delimiter: '',
        // Money unit -> "R$ 12.345.678,90"
        unit: '',
        // Money unit -> "12.345.678,90 R$"
        suffixUnit: '',
        // Force type only number instead decimal,
        // masking decimals with ",00"
        // Zero cents -> "R$ 1.234.567.890,00"
        zeroCents: false
    })
}

export const moedaParaNumero = (valor) => {
    return isNaN(valor) == false ? parseFloat(valor) : parseFloat(valor.replace("R$", "").replace(".", "").replace(",", "."));
}