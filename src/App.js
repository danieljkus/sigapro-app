import React, {Component} from 'react';

import AppNavigator from './screens';
import ErrorBoundary from "./utils/Errors";

export default class App extends Component {
    render() {
        return (
            <ErrorBoundary>
                <AppNavigator/>
            </ErrorBoundary>
        );
    }
}
