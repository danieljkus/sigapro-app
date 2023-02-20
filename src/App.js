import React, {Component, useEffect} from 'react';
import AppNavigator from './screens';
import ErrorBoundary from "./utils/Errors";

import {Provider} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';
import store from "./components/Notification/store";
import {AppOffline} from "./components/Offline";
import SnackbarAlerts from "./components/Notification/SnackbarAlerts";
import {Interceptors} from "./components/Interceptors";

const App = () => {
    return (
        <ErrorBoundary>
            <PaperProvider>
                <Provider store={store}>
                    <AppOffline/>
                    <Interceptors/>
                    <SnackbarAlerts/>
                    <AppNavigator/>
                </Provider>
            </PaperProvider>

        </ErrorBoundary>
    );
};
export default App;
