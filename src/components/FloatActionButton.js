import React from 'react';
import {View, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
    fab: {
        height: 48, width: 48,
        position: 'absolute',
        bottom: 25,
        right: 24,
        borderRadius: 24,
        elevation: 4,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
});

const FloatActionButton = (props) => {
    const {
        iconFamily, iconName, iconColor, backgroundColor, onPress,
        marginBottom = 25, marginRight = 24
    } = props;
    return (
        <View
            style={[
                styles.fab,
                {bottom: marginBottom},
                {right: marginRight},
                {backgroundColor}
            ]}
        >
            <TouchableOpacity onPress={onPress} style={styles.content} disabled={props?.disabled}>
                <View style={styles.content}>
                    {props?.loading && props?.iconName === 'add' ? <ActivityIndicator size="large" color={'white'}/> :
                        <Icon family={iconFamily} name={iconName} color={iconColor} size={24}/>}
                </View>
            </TouchableOpacity>
        </View>
    );
}

export default FloatActionButton;
