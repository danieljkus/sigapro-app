import React from 'react';
import {Platform, StatusBar as SB} from 'react-native';

const {OS} = Platform;

import Colors from '../values/Colors';

const StatusBar = (props) => {
    return (
        <SB
            animated={props?.animated}
            backgroundColor={props?.backgroundColor}
            showHideTransition={props?.showHideTransition}
            barStyle={props?.barStyle}
            translucent={props?.translucent}
            {...props}
        />
    )
};

StatusBar.propTypes = {
    ...SB.propTypes
};

StatusBar.defaultProps = {
    animated: true,
    backgroundColor: '#1F829C',
    showHideTransition: 'fade',
    barStyle: OS === 'ios' ? 'dark-content' : 'light-content',
    translucent: false,
};

export default StatusBar;