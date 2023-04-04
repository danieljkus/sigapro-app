import React, { Component } from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import HeaderComponent from "../components/HeaderComponent";

export default class TrocarFilialScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,
            usuario: '',
            filial: '',
        }
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onFormSubmit = (event) => {
        if (checkFormIsValid(this.refs)) {
            this.onSalvarRegistro();
        } else {
            Alert.showAlert('Preencha todos os campos obrigatórios');
        }
    }

    onSalvarRegistro = () => {
        this.setState({ salvado: true, loading: true });
        const { usuario, filial } = this.state;

        axios.put('/usuarios/updateFilialSIGAPRO/' + usuario + '/' + filial)
            .then(response => {
                this.props.navigation.goBack(null);
            }).catch(ex => {
                this.setState({ salvado: false });
                console.warn(ex);
                console.warn(ex.response);
            })
    }


    render() {
        const { usuario, filial, loading, salvado } = this.state;

        return (
            <SafeAreaView style={{ backgroundColor: '#1F829C', flex: 1 }}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Trocar de Filial'}
                    pressLeftComponen={() => this.props.navigation.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <StatusBar />

                    <ScrollView
                        style={{ flex: 1, }}
                        keyboardShouldPersistTaps="always"
                    >
                        <View
                            style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 20 }}
                        >

                            <View>
                                <TextInput
                                    label="Usuario"
                                    id="usuario"
                                    ref="usuario"
                                    value={usuario}
                                    maxLength={11}
                                    onChange={this.onInputChange}
                                    validator={value => !!value}
                                    keyboardType="numeric"
                                    required={true}
                                    errorMessage="Usuário é obrigatório"
                                    style={{ textTransform: 'uppercase' }}
                                />

                                <TextInput
                                    label="Código da Filial"
                                    id="filial"
                                    ref="filial"
                                    value={filial}
                                    maxLength={5}
                                    onChange={this.onInputChange}
                                    validator={value => !!value}
                                    keyboardType="numeric"
                                    required={true}
                                    errorMessage="A filial é obrigatória"
                                />
                            </View>


                            <Button
                                title="SALVAR"
                                loading={loading}
                                onPress={this.onFormSubmit}
                                color={Colors.textOnPrimary}
                                buttonStyle={{ marginBottom: 20, marginTop: 20 }}
                                icon={{
                                    name: 'check',
                                    type: 'font-awesome',
                                    color: Colors.textOnPrimary
                                }}
                            />

                        </View>

                        <ProgressDialog
                            visible={salvado}
                            title="App Nordeste"
                            message="Gravando. Aguarde..."
                        />
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}