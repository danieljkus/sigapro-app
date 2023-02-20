// CREATED BY MAYK FELIX 17/02/2023

import {createStore, combineReducers} from 'redux';
import alertReducer from './actions/alertReducer';

const rootReducer = combineReducers({
    alert: alertReducer,
});

const store = createStore(rootReducer);

export default store;
