import React, { Component, createRef } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';

import { RNCamera } from 'react-native-camera';
import Orientation from 'react-native-orientation';

import Button from '../components/Button';
import Colors from '../values/Colors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1,
        // margin: 50,
        // padding: 30,
    },
    preview: {
        flex: 1,
        // justifyContent: 'flex-end',
        // alignItems: 'center',
    },
})

export default class BarCodeScreen extends Component {

    barCodeReaded = false

    constructor(props) {
        super(props);

        this.camera = createRef();

        this.state = {
            onBarCodeRead: this.props.navigation.state.params.onBarCodeRead
        }
    }

    componentDidMount() {
        Keyboard.dismiss();
        Orientation.lockToLandscapeRight();
    }

    back = () => {
        this.props.navigation.goBack(null);
        Orientation.lockToPortrait();
    }

    onBarCodeRead = event => {
        if (!this.barCodeReaded) {
            this.barCodeReaded = true;
            this.back()
            this.state.onBarCodeRead(event);
        }
    }

    onBackPress = () => {
        this.back()
    }

    render() {
        const { flash } = this.state;
        console.log(flash)
        return (
            <View style={styles.container}>
                <RNCamera
                    style={styles.preview}
                    captureAudio={false}
                    androidCameraPermissionOptions={{
                        title: 'Permissão para usar a câmera',
                        message: 'O app precisa de permissão para escanear o código de barras,',
                        buttonPositive: 'Permitir',
                        buttonNegative: 'Cancelar',
                    }}
                    type={RNCamera.Constants.Type.back}
                    onBarCodeRead={this.onBarCodeRead}
                    ref={this.camera}
                >
                    <View style={{ flex: 8, }}>
                        <View
                            style={{
                                borderWidth: 1,
                                margin: 20,
                                flex: 0.9,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                        </View>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: Colors.textOnPrimary,
                                borderRadius: 3,
                            }}
                        >
                            <Button
                                title="Voltar"
                                onPress={this.onBackPress}
                            />
                        </View>
                    </View>
                </RNCamera>
            </View>
        );
    }
}
