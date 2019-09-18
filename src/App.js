import React, { Component } from 'react';

import Orientation from 'react-native-orientation';

import AppNavigator from './screens';

Orientation.lockToPortrait();

export default class App extends Component {
    render() {
        return (
            <AppNavigator />
        );
    }
}
