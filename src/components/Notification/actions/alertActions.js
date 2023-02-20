// CREATED BY MAYK FELIX 17/02/2023

export const showSnackbar = (message) => {
    return {
        type: 'OPEN_SNACKBAR',
        payload: message,
        message: message,
    };
};

export const hideSnackbar = () => {
    return {
        type: 'CLOSE_SNACKBAR',
    };
};
