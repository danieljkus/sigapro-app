import React, { Component } from 'react';
import {
    View, ScrollView, Dimensions, RefreshControl, Text, FlatList,
    ActivityIndicator, Modal, TouchableOpacity
} from 'react-native';
import { CheckBox, Card, Divider, SearchBar } from 'react-native-elements';

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
import VeiculosSelect from '../components/VeiculosSelect';


export default class CheckListItemScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvando: false,
            refreshing: false,

            veiculo_select: null,

            man_os_idf: 0,
            adm_spcl_veiculo: "",
            adm_spcl_obs: "",
            listaItens: [],

            resposta: '',

            ...props.navigation.state.params.registro,
        }
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeVeiculo = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codVeiculo: value.codVeic,
                descr_destino: value.adm_vei_placa + ' - ' + value.adm_veimarca_descricao_chassi,
            });
        }
    }

    onMudaResposta = (tipo) => {
        console.log('onMudaResposta: ', tipo);
        this.setState({
            resposta: tipo,
        });
    }









    render() {
        // const { adm_spcl_veiculo } = this.state.registro;
        const { adm_spcl_veiculo, veiculo_select, adm_spcl_obs, resposta,
            salvando, loading, refreshing, carregarRegistro } = this.state;

        let imagemHeigth = Dimensions.get('window').height;

        console.log('this.state', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >

                    <View>
                        <View style={{ margin: 15, marginBottom: -10 }}>
                            <VeiculosSelect
                                label="Veículo"
                                id="veiculo_select"
                                value={veiculo_select}
                                codVeiculo={adm_spcl_veiculo}
                                onChange={this.onInputChangeVeiculo}
                                onErro={this.onErroChange}
                                tipo=""
                            />

                            <TextInput
                                label="Observação"
                                id="adm_spcl_obs"
                                ref="adm_spcl_obs"
                                value={adm_spcl_obs}
                                maxLength={200}
                                onChange={this.onInputChange}
                                multiline={true}
                                height={50}
                            />
                        </View>

                        <View>
                            <View
                                style={{
                                    height: imagemHeigth - 270,
                                    backgroundColor: Colors.primaryLight,
                                    margin: 15,
                                }}
                            >
                                <View style={{ flex: 1, margin: 20, paddingBottom: 30, height: 40, alignItems: "center", borderBottomWidth: 1, borderColor: Colors.primary }}>
                                    <Text style={{ fontSize: 30, color: Colors.textOnPrimary, fontWeight: "bold" }} >TITULO</Text>
                                </View>

                                <View style={{ flex: 15, margin: 10, marginTop: -10 }}>
                                    <Text style={{ fontSize: 15, color: Colors.textOnPrimary }} >DESCRIÇÃO DO CHECK-LIST</Text>
                                    <Text style={{ fontSize: 15, color: Colors.textOnPrimary }} >DESCRIÇÃO DO CHECK-LIST</Text>
                                    <Text style={{ fontSize: 15, color: Colors.textOnPrimary }} >DESCRIÇÃO DO CHECK-LIST</Text>
                                    <Text style={{ fontSize: 15, color: Colors.textOnPrimary }} >DESCRIÇÃO DO CHECK-LIST</Text>
                                    <Text style={{ fontSize: 15, color: Colors.textOnPrimary }} >DESCRIÇÃO DO CHECK-LIST</Text>
                                    <Text style={{ fontSize: 15, color: Colors.textOnPrimary }} >DESCRIÇÃO DO CHECK-LIST</Text>
                                </View>



                                <View style={{ height: 30, flexDirection: 'row', margin: 10, marginBottom: -20, alignItems: "center", justifyContent: 'center' }}>
                                    <View style={{ height: 30, width: "50%", flexDirection: 'row', margin: 5, justifyContent: "flex-start" }}>
                                        <TouchableOpacity
                                            onPress={() => this.onMudaResposta('CO')}
                                            style={{ alignItems: "center", justifyContent: 'center' }}
                                        >
                                            <View style={{ width: "50%", marginTop: 5, flexDirection: 'row', justifyContent: 'center' }}>
                                                <Icon
                                                    name='chevron-left'
                                                    family='FontAwesome'
                                                    color={Colors.textOnPrimary}
                                                    size={20}
                                                />
                                            </View>
                                            <Text style={{ fontSize: 8, color: Colors.textOnPrimary }} >Anterior</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ height: 30, width: "50%", flexDirection: 'row', margin: 5, justifyContent: "flex-end" }}>
                                        <TouchableOpacity
                                            onPress={() => this.onMudaResposta('NC')}
                                            style={{ alignItems: "center", justifyContent: 'center' }}
                                        >
                                            <View style={{ width: "50%", marginTop: 5, flexDirection: 'row', justifyContent: 'center' }}>
                                                <Icon
                                                    name='chevron-right'
                                                    family='FontAwesome'
                                                    color={Colors.textOnPrimary}
                                                    size={20}
                                                />
                                            </View>
                                            <Text style={{ fontSize: 8, color: Colors.textOnPrimary }} >Próximo</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>


                                <View style={{ height: 70, flexDirection: 'row', margin: 10, alignItems: "center", justifyContent: 'center', backgroundColor: Colors.dividerDark }}>
                                    <TouchableOpacity
                                        onPress={() => this.onMudaResposta('CO')}
                                        style={{ alignItems: "center", justifyContent: 'center' }}
                                    >
                                        <View style={{ width: 100, marginTop: 0, flexDirection: 'row', justifyContent: 'center' }}>
                                            <Icon
                                                name='like'
                                                family='Foundation'
                                                color={Colors.primaryDark}
                                                size={40}
                                            />
                                        </View>
                                        <Text style={{ fontSize: 10, color: Colors.textOnPrimary }} >Conforme</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => this.onMudaResposta('NC')}
                                        style={{ alignItems: "center", justifyContent: 'center' }}
                                    >
                                        <View style={{ width: 100, marginTop: 0, flexDirection: 'row', justifyContent: 'center' }}>
                                            <Icon
                                                name='dislike'
                                                family='Foundation'
                                                color={Colors.textOnPrimary}
                                                size={40}
                                            />
                                        </View>
                                        <Text style={{ fontSize: 10, color: Colors.textOnPrimary }} >Não Conforme</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => this.onMudaResposta('NA')}
                                        style={{ alignItems: "center", justifyContent: 'center' }}
                                    >
                                        <View style={{ width: 100, marginTop: 0, flexDirection: 'row', justifyContent: 'center' }}>
                                            <Icon
                                                name='close'
                                                type='Foundation'
                                                color={Colors.textOnPrimary}
                                                size={40}
                                            />
                                        </View>
                                        <Text style={{ fontSize: 10, color: Colors.textOnPrimary }} >Não se Aplica</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </View>



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