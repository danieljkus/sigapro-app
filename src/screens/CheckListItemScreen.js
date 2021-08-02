import React, { Component } from 'react';
import { View, ScrollView, RefreshControl, Text, FlatList, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { Card, Divider, SearchBar } from 'react-native-elements';

import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import { getTemPermissao, getPermissoes } from '../utils/LoginManager';
import moment from 'moment';
import Icon from '../components/Icon';


export default class CheckListItemScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvando: false,
            refreshing: false,

            man_os_idf: 0,
            adm_spcl_veiculo: "",
            adm_spcl_servico: 0,
            adm_spcl_servico_extra: 0,
            adm_spcl_obs: "",
            listaItens: [],
          
            // ...props.navigation.state.params.registro,
        }
    }

    render() {
        // const { } = this.state.registro;
        const { salvando, loading, refreshing, carregarRegistro } = this.state;

        console.log('this.state', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >




                    <ProgressDialog
                        visible={carregarRegistro}
                        title="SIGA PRO"
                        message="Carregando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}