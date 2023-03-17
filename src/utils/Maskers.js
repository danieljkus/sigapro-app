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
}

export const maskDigitarVlrMoeda = (numero) => {
    var v = numero.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return v;
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


// FORMATA A DATA PARA O DIA/MES/ANO
export function formatDate(dataLimite = new Date()) {
    if (dataLimite) {
        let dataToday;
        let data = new Date(dataLimite);
        let dia = data.getDate();
        let mes = data.getMonth() + 1;
        let ano = data.getFullYear();
        if (dia < 10) {
            dia = '0' + dia;
        }
        if (mes < 10) {
            mes = '0' + mes;
        }
        dataToday = dia + '-' + mes + '-' + ano + '00:00 UTC';
        return dataToday;
    }
}

export function formatDateBasic(dataLimite = new Date()) {
    if (dataLimite) {
        let dataToday;
        let data = new Date(dataLimite);
        let dia = data.getDate();
        let mes = data.getMonth() + 1;
        let ano = data.getFullYear();
        if (dia < 10) {
            dia = '0' + dia;
        }
        if (mes < 10) {
            mes = '0' + mes;
        }
        dataToday = dia + '-' + mes + '-' + ano;
        return dataToday;
    }
}

export function formatHourBasic(dataLimite = new Date()) {
    if (dataLimite) {
        let hourToday;
        let data = new Date(dataLimite);
        let minitos = data.getTime();
        let horas = data.getHours() + 1;
        hourToday = minitos + ':' + horas;
        return hourToday;
    }
}

// TRATA O FORMATO DA DATA DO RNDateTimePicker PARA DIA July ANO 00:00 UTC``
export function formatDateValue(value = new Date() , hour = "00:00") {
    try {
        const dataString = value;
        const horaString = hour;
        const [dia, mes, ano] = dataString.split('/');
        const [hora, minuto] = horaString.split(':');
        const data = new Date(ano, mes - 1, dia, hora, minuto);
        const dataFormatada = data.toString();
        return new Date(dataFormatada) // FORMATO (DIA July ANO 00:00 UTC)
    } catch (e) {
        return new Date()
    }
};
