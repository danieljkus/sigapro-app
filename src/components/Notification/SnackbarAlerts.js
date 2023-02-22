// CREATED BY MAYK FELIX 17/02/2023
import React, {useEffect} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Button, Snackbar} from 'react-native-paper';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Icon} from "react-native-elements";
import Colors from "../../values/Colors";

const SnackbarAlerts = ({message, isVisible}) => {
    const dispatch = useDispatch();


    useEffect(() => {
        setTimeout(() => {
            console.log('CLOSE_SNACKBAR');
            dispatch({type: 'CLOSE_SNACKBAR', isVisible: false})
        }, 7000)
    }, []);


    if (!isVisible) {
        return null;
    }

    // return (
    //     <View style={styles.container}>
    //         <View style={styles.fab}>
    //             <View style={styles.center}>
    //                 <Text numberOfLines={1} style={{maxWidth: '90%', fontWeight: 'bold', color: 'white'}}>
    //                     {message}
    //                 </Text>
    //                 <TouchableOpacity onPress={() => dispatch({type: 'CLOSE_SNACKBAR', isVisible: false})} style={{}}>
    //                     <Icon name="check" size={30} color="#FFF"/>
    //                 </TouchableOpacity>
    //             </View>
    //         </View>
    //     </View>
    // );

    return (
        <Snackbar
            style={{
                backgroundColor: Colors.dark,
            }}
            // elevation={5}
            duration={7000}
            visible={isVisible}
            onDismiss={() => dispatch({type: 'CLOSE_SNACKBAR', isVisible: false})}
            icon={require('react-native-vector-icons/EvilIcons')}
            // action={{
            //     label: 'OK',
            //     onPress: () => dispatch({type: 'CLOSE_SNACKBAR', isVisible: false}),
            // }}
        >
            <Text style={{color: 'white', fontWeight: 'bold'}}>
                {message}
            </Text>
        </Snackbar>
    );
};

const mapStateToProps = (state) => {
    return {
        message: state.alert.message,
        isVisible: state.alert.isVisible,
        duration: state.alert.duration,
    };
};


const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        alignItems: 'center',
        bottom: 10,
        right: 0,
        left: 0,
    },
    fab: {
        width: '90%',
        height: 45,
        elevation: 8,
        borderRadius: 4,
        justifyContent: 'center',
        backgroundColor: Colors.dark,

    },
    center: {
        marginHorizontal: '5%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    }
});

export default connect(mapStateToProps)(SnackbarAlerts);
