import React, {Component, useEffect} from 'react';
import AppNavigator from './screens';
import ErrorBoundary from "./utils/Errors";

import {Provider} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';
import store from "./components/Notification/store";
import {AppOffline} from "./components/Offline";
import SnackbarAlerts from "./components/Notification/SnackbarAlerts";
import {verifyGeolocationActive, verifyLocationPermission} from "./components/getGeolocation";

// import {request, PERMISSIONS} from 'react-native-permissions';


const App = () => {

    useEffect(() => {
        (async () => {
            await verifyLocationPermission();
            await verifyGeolocationActive();
            // request(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA).then((result) => {
            //     // setPermissionResult(result)
            //     console.log(result)
            // });
            // request(Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY : PERMISSIONS.ANDROID.CAMERA).then((result) => {
            //     // setPermissionResult(result)
            //     console.log(result)
            // });
        })()
    }, []);

    return (
        <ErrorBoundary>
            <PaperProvider>
                <Provider store={store}>
                    <AppOffline/>
                    {/*<Interceptors/>*/}
                    <SnackbarAlerts/>
                    <AppNavigator/>
                </Provider>
            </PaperProvider>

        </ErrorBoundary>
    );
};
export default App;
