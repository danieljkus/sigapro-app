// CREATED BY MAYK FELIX 17/02/2023

const initialState = {
    message: null,
    isVisible: false,
    duration: 7000, // VALUE DEFAULT
};

const alertReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'OPEN_SNACKBAR':
            return {
                ...state,
                message: action?.payload,
                duration: 7000, // VALUE DEFAULT
                isVisible: true,
            };
        case 'CLOSE_SNACKBAR':
            return {
                ...state,
                isVisible: false,
            };
        default:
            return state;
    }
};

export default alertReducer;
