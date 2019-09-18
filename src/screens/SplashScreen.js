import React, { Component } from 'react';
import { View, Text, ImageBackground } from 'react-native';

import { NavigationActions } from 'react-navigation';

import { isLoggedIn } from '../utils/LoginManager';

export default class SplashScreen extends Component {

    componentWillMount() {
        this.init();
    }

    async init() {
        const isLogged = await isLoggedIn();

        let routeName;
        if (isLogged) {
            routeName = "HomeScreen";
        } else {
            routeName = "LoginScreen";
        }

        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: routeName })
            ]
        })

        this.props.navigation.dispatch(resetAction);
    }


    render() {
        return (
            <View>
                {/* <Text>Nordeste</Text> */}
            </View>
        )
    }
}
