import React, { Component } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';

import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { validateSenha, checkFormIsValid } from '../utils/Validator';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import { getUsuario } from '../utils/LoginManager';

export default class TrocarSenhaScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,
            adm_pes_pfj: '',
            usu_senha: '',
            usu_senha_Conf: '',
        }
    }

    componentDidMount() {
        getUsuario().then(usuario => {
            this.setState({
                adm_pes_pfj: usuario.adm_pes_pfj,
            });
        })
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onFormSubmit = (event) => {
        const { usu_senha, usu_senha_Conf } = this.state;
        if (usu_senha !== usu_senha_Conf) {
            Alert.showAlert('As senhas não conferem');
            return;
        }

        if (checkFormIsValid(this.refs)) {
            this.onSalvarRegistro();
        } else {
            Alert.showAlert('Preencha todos os campos obrigatórios');
        }
    }

    onSalvarRegistro = () => {
        this.setState({ salvado: true, loading: true });
        const { adm_pes_pfj, usu_senha } = this.state;

        axios.put('/usuarios/updateSenha/' + adm_pes_pfj, {
            "senha": usu_senha
        }).then(response => {
            this.props.navigation.goBack(null);
        }).catch(ex => {
            this.setState({ salvado: false });
            console.warn(ex);
        })
    }


    render() {
        const { adm_pes_pfj, usu_senha, usu_senha_Conf, loading, salvado } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                    refreshControl={(
                        <RefreshControl
                            refreshing={loading}
                        />
                    )}
                >
                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 20 }}
                    >

                        <View>
                            <TextInput
                                label="Nova Senha"
                                id="usu_senha"
                                ref="usu_senha"
                                value={usu_senha}
                                maxLength={10}
                                onChange={this.onInputChange}
                                required={true}
                                secureTextEntry={true}
                                validator={validateSenha}
                                errorMessage="A senha deve conter de 6 a 10 caracteres."
                            />

                            <TextInput
                                label="Confirma a Nova Senha"
                                id="usu_senha_Conf"
                                ref="usu_senha_Conf"
                                value={usu_senha_Conf}
                                maxLength={10}
                                onChange={this.onInputChange}
                                required={true}
                                secureTextEntry={true}
                                validator={validateSenha}
                                errorMessage="A senha deve conter de 6 a 10 caracteres."
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
                        title="SIGA PRO"
                        message="Gravando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}
