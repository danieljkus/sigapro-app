// CREATED BY MAYK FELIX 08/02/2023
import React, {Component} from 'react';
import {Pressable, StyleSheet, Text, View, Share, Image, Alert, SafeAreaView} from "react-native";
import Colors from '../values/Colors';

/*
Um erro de JavaScript em uma parte da UI não deve quebrar toda a aplicação.
Para resolver este problema para usuários do React,o React 16 introduziu um novo conceito de “error boundary”.
*/
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            info: "",
            error: "",
        };
    }

    componentDidCatch(error, info) {
        this.setState({
            hasError: true,
            info: info,
            error: error,
        });
    }


    shareError = async message => {
        try {
            const result = await Share.share({message: message});
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    viewError = () => Alert.alert('Error', `${this.state.error}`, [{text: 'OK'}], {cancelable: false});
    restart = () => {
        this.setState({
            hasError: false,
            info: "",
            error: "",
        });
        return this.props.children;
    };

    render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>

                    <Image
                        style={{
                            width: '100%',
                        }}
                        resizeMode="contain"
                        source={require('./../drawables/logo_pequeno.png')}
                    />
                    <View style={{top: 15}}>
                        <Text style={styles.text}>{'"O aplicativo parou de funcionar"'}</Text>
                    </View>
                    <View style={styles.contentView}>
                        <Pressable onPress={() => this.shareError(`${this.state.error}`)}
                                   style={styles.pressable}>
                            <Text style={styles.textPressable}>{'Compartilhar error'}</Text>
                        </Pressable>
                        <Pressable onPress={() => this.viewError()} style={styles.pressable}>
                            <Text style={styles.textPressable}>{'Visualizar erro'}</Text>
                        </Pressable>
                        <Pressable onPress={() => this.restart()} style={styles.pressable}>
                            <Text style={styles.textPressable}>{'Voltar'}</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            )
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    viewPressable: {
        top: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentView: {
        margin: 30,
    },
    pressable: {
        backgroundColor: Colors.yellow,
        width: 200,
        height: 30,
        justifyContent: 'center',
        margin: 10,
        borderRadius: 20
    },
    textPressable: {
        textAlign: "center",
        fontSize: 20,
    },
    image: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    },
    text: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "bold",
    }
});

export default ErrorBoundary;
