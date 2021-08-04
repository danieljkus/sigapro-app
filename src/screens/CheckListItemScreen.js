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
            codVeiculo: '',
            escala: '',

            modalOBSVisible: false,

            adm_spcl_idf: props.navigation.state.params.registro.adm_spcl_idf ? props.navigation.state.params.registro.adm_spcl_idf : 0,
            adm_spcl_obs: props.navigation.state.params.registro.adm_spcl_obs ? props.navigation.state.params.registro.adm_spcl_obs : '',

            listaRegistros: props.navigation.state.params.registro.listaRegistros ? props.navigation.state.params.registro.listaRegistros : [],

            adm_spcli_seq: 0,
            adm_spcli_item: 0,
            adm_spicl_descricao: '',
            adm_spicl_obs: '',
            adm_spcli_check: '',
            adm_spcli_obs: '',

            ...props.navigation.state.params.registro,
        }
    }

    componentDidMount() {
        console.log('componentDidMount: ', this.props.navigation.state.params.registro)

        if (this.props.navigation.state.params.registro.adm_spcl_idf) {
            this.setState({
                codVeiculo: this.props.navigation.state.params.registro.adm_spcl_veiculo ? this.props.navigation.state.params.registro.adm_spcl_veiculo : '',
            });
        } else {
            this.setState({
                refreshing: true,
            },
                this.getListaRegistros()
            );
        }
    }

    getListaRegistros = () => {
        axios.get('/checkList/listaItens')
            .then(response => {
                const lista = response.data.map(regList => {
                    return {
                        adm_spcli_item: regList.adm_spicl_codigo,
                        adm_spcli_check: '',
                        adm_spcli_obs: '',
                        adm_spicl_descricao: regList.adm_spicl_descricao,
                        adm_spicl_obs: regList.adm_spicl_obs,
                    }
                });
                this.setState({
                    listaRegistros: lista,
                    refreshing: false,
                    carregando: false,
                })
            }).catch(ex => {
                console.warn('Erro Busca:', ex);
                this.setState({
                    refreshing: false,
                    carregando: false,
                });
            })
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
            }, this.onMudaItem);
        }
    }

    onGravarRegistro = () => {
        this.setState({ salvando: true });

        const registro = {
            adm_spcl_idf: 0,
            adm_spcl_veiculo: this.state.codVeiculo ? this.state.codVeiculo : '',
            adm_spcl_obs: this.state.adm_spcl_obs ? this.state.adm_spcl_obs : '',

            listaItens: this.state.listaRegistros,
        };

        console.log('onSalvarRegistro: ', registro);
        // return;

        axios.post('/checkList/store', registro)
            .then(response => {
                this.props.navigation.goBack(null);
                if (this.props.navigation.state.params.onRefresh) {
                    this.props.navigation.state.params.onRefresh();
                }
            }).catch(ex => {
                this.setState({ salvado: false });
                console.warn(ex);
            })
    }


    onMudaItem = (tipo) => {
        if (this.state.codVeiculo) {
            // console.log('onMudaItem: ', tipo);
            // console.log('onMudaItem total: ', this.state.listaRegistros.length);
            // console.log('onMudaItem atual: ', this.state.adm_spcli_seq);

            let total = this.state.listaRegistros.length;
            let seq = this.state.adm_spcli_seq;
            if (tipo === 'P') {
                if (this.state.adm_spcli_seq < total - 1) {
                    seq = this.state.adm_spcli_seq + 1;
                }
            } else if (tipo === 'A') {
                if (this.state.adm_spcli_seq > 0) {
                    seq = this.state.adm_spcli_seq - 1;
                }
            }

            // console.log('onMudaItem novo: ', seq);

            let ok = true;
            if ((this.state.adm_spcl_idf === 0) && (seq === total - 1)) {
                for (var x in this.state.listaRegistros) {
                    if (this.state.listaRegistros[x].adm_spcli_check === '') {
                        ok = false;
                    }
                };
                for (var x in this.state.listaRegistros) {
                    if ((this.state.listaRegistros[x].adm_spcli_check === 'NC') && (this.state.listaRegistros[x].adm_spcli_obs === '')) {
                        ok = false;
                    }
                };

                if (ok) {
                    Alert.showConfirm("Check-List Concluído. Deseja salvar?",
                        { text: "Não" },
                        {
                            text: "Sim",
                            onPress: () => this.onGravarRegistro(),
                            style: "destructive"
                        }
                    )
                }
            }


            const codigoItem = seq >= 0 && seq < 9999 ? this.state.listaRegistros[seq].adm_spcli_item : 0;
            const descrItem = seq >= 0 && seq < 9999 ? this.state.listaRegistros[seq].adm_spicl_descricao : '';
            const obsItem = seq >= 0 && seq < 9999 ? this.state.listaRegistros[seq].adm_spicl_obs : '';
            const check = seq >= 0 && seq < 9999 ? this.state.listaRegistros[seq].adm_spcli_check : '';
            const obs = seq >= 0 && seq < 9999 ? this.state.listaRegistros[seq].adm_spcli_obs : '';

            this.setState({
                adm_spcli_seq: seq,
                adm_spcli_item: codigoItem,
                adm_spicl_descricao: descrItem,
                adm_spicl_obs: obsItem,
                adm_spcli_check: check,
                adm_spcli_obs: obs,
            });
        }
    }


    onMudaResposta = (tipo) => {
        console.log('onMudaResposta: ', tipo);
        if (this.state.adm_spcl_idf === 0) {
            this.state.listaRegistros[this.state.adm_spcli_seq].adm_spcli_check = tipo;
            if (tipo === 'NC') {
                this.setState({ modalOBSVisible: true });
            } else {
                this.onMudaItem('P');
            }
        }
    }

    onOBSPress = (visible) => {
        // console.log('onOBSPress: ', visible);
        if (this.state.listaRegistros[this.state.adm_spcli_seq].adm_spcli_check === 'NC') {
            this.setState({ modalOBSVisible: visible });
            if ((this.state.adm_spcl_idf === 0) && (!visible)) {
                // console.log('onOBSPress: ', this.state.adm_spcli_obs);
                this.state.listaRegistros[this.state.adm_spcli_seq].adm_spcli_obs = this.state.adm_spcli_obs;
                this.onMudaItem('P');
            }
        }
    }





    render() {
        const { codVeiculo, veiculo_select, adm_spcl_obs, adm_spcl_idf, escala,
            adm_spcli_check, adm_spcli_obs, adm_spicl_descricao, adm_spicl_obs,
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
                            <View style={{ marginTop: -5 }}>
                                <VeiculosSelect
                                    label="Veículo"
                                    id="veiculo_select"
                                    value={veiculo_select}
                                    codVeiculo={codVeiculo}
                                    onChange={this.onInputChangeVeiculo}
                                    onErro={this.onErroChange}
                                    tipo="escala"
                                    enabled={!adm_spcl_idf}
                                />
                            </View>

                            <View style={{ marginTop: -15 }}>
                                <TextInput
                                    label="Escala"
                                    id="escala"
                                    ref="escala"
                                    value={escala}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>

                            <View style={{ marginTop: -15 }}>
                                <TextInput
                                    label="Observação Geral"
                                    id="adm_spcl_obs"
                                    ref="adm_spcl_obs"
                                    value={adm_spcl_obs}
                                    maxLength={200}
                                    onChange={this.onInputChange}
                                    multiline={true}
                                    height={40}
                                />
                            </View>
                        </View>

                        <View>
                            {!codVeiculo ? (

                                <View
                                    style={{
                                        height: imagemHeigth - 270,
                                        backgroundColor: Colors.primaryLight,
                                        margin: 10, marginTop: 0
                                    }}
                                >
                                    <View style={{ flex: 1, margin: 20, marginTop: 10, paddingBottom: 30, height: 40, alignItems: "center" }}>
                                        <Text style={{ fontSize: 25, color: Colors.textOnPrimary, fontWeight: "bold" }} >CHECK-LIST</Text>
                                    </View>
                                </View>

                            ) : (

                                <View
                                    style={{
                                        height: imagemHeigth - 270,
                                        backgroundColor: Colors.primaryLight,
                                        margin: 10, marginTop: 0
                                    }}
                                >
                                    <View style={{ flex: 1, margin: 20, marginTop: 10, paddingBottom: 30, height: 40, alignItems: "center" }}>
                                        <Text style={{ fontSize: 25, color: Colors.textOnPrimary, fontWeight: "bold" }} >{adm_spicl_descricao}</Text>
                                    </View>
                                    <View style={{ flex: 25, margin: 10, marginTop: -10 }}>
                                        <Text style={{ fontSize: 15, color: Colors.textOnPrimary }} >{adm_spicl_obs}</Text>
                                    </View>


                                    <View style={{ height: 30, flexDirection: 'row', margin: 10, marginBottom: 0, alignItems: "center", justifyContent: 'center' }}>
                                        <View style={{ height: 30, width: "20%", flexDirection: 'row', margin: 5, justifyContent: "flex-start" }}>
                                            <TouchableOpacity
                                                onPress={() => this.onMudaItem('A')}
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
                                        <View style={{ height: 30, width: "55%", flexDirection: 'row', margin: 5, justifyContent: "flex-start" }}>
                                            <Text style={{ fontSize: 12, color: Colors.textHintLight }} >{adm_spcli_check === 'NC' ? adm_spcli_obs : ''}</Text>
                                        </View>
                                        <View style={{ height: 30, width: "20%", flexDirection: 'row', margin: 5, justifyContent: "flex-end" }}>
                                            <TouchableOpacity
                                                onPress={() => this.onMudaItem('P')}
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


                                    <View style={{ height: 50, flexDirection: 'row', margin: 5, alignItems: "center", justifyContent: 'center', backgroundColor: Colors.dividerDark }}>
                                        <TouchableOpacity
                                            onPress={() => this.onMudaResposta('CO')}
                                            style={{ alignItems: "center", justifyContent: 'center' }}
                                        >
                                            <View style={{ width: 100, marginTop: 0, flexDirection: 'row', justifyContent: 'center' }}>
                                                <Icon
                                                    name='like'
                                                    family='Foundation'
                                                    color={adm_spcli_check === 'CO' ? Colors.primaryDark : Colors.textOnPrimary}
                                                    size={40}
                                                />
                                            </View>
                                            <Text style={{ marginTop: -5, fontSize: 10, color: Colors.textOnPrimary }} >Conforme</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => this.onMudaResposta('NC')}
                                            onLongPress={() => this.onOBSPress(true)}
                                            style={{ alignItems: "center", justifyContent: 'center' }}
                                        >
                                            <View style={{ width: 100, marginTop: 0, flexDirection: 'row', justifyContent: 'center' }}>
                                                <Icon
                                                    name='dislike'
                                                    family='Foundation'
                                                    color={adm_spcli_check === 'NC' ? Colors.primaryDark : Colors.textOnPrimary}
                                                    size={40}
                                                />
                                            </View>
                                            <Text style={{ marginTop: -5, fontSize: 10, color: Colors.textOnPrimary }} >Não Conforme</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => this.onMudaResposta('NA')}
                                            style={{ alignItems: "center", justifyContent: 'center' }}
                                        >
                                            <View style={{ width: 100, marginTop: 0, flexDirection: 'row', justifyContent: 'center' }}>
                                                <Icon
                                                    name='close'
                                                    type='Foundation'
                                                    color={adm_spcli_check === 'NA' ? Colors.primaryDark : Colors.textOnPrimary}
                                                    size={40}
                                                />
                                            </View>
                                            <Text style={{ marginTop: -5, fontSize: 10, color: Colors.textOnPrimary }} >Não se Aplica</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            )}
                        </View>
                    </View>




                    {/* ----------------------------- */}
                    {/* MODAL PARA FILTROS            */}
                    {/* ----------------------------- */}
                    <Modal
                        visible={this.state.modalOBSVisible}
                        onRequestClose={() => { console.log("Modal OBS FECHOU.") }}
                        animationType={"slide"}
                        transparent={true}
                    >
                        <View style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                        }}>
                            <View style={{
                                flex: 1,
                                width: "90%",
                                paddingTop: 10,
                            }} >
                                <View style={{
                                    paddingVertical: 15,
                                    paddingHorizontal: 15,
                                    backgroundColor: Colors.background,
                                    borderRadius: 5,
                                }}>

                                    <View style={{ backgroundColor: Colors.primary, flexDirection: 'row' }}>
                                        <Text style={{
                                            color: Colors.textOnPrimary,
                                            marginTop: 15,
                                            marginBottom: 15,
                                            marginLeft: 16,
                                            textAlign: 'center',
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                        }}>Observação</Text>
                                    </View>

                                    <View style={{ marginTop: 4, paddingVertical: 10 }}>
                                        <TextInput
                                            label="Observação"
                                            id="adm_spcli_obs"
                                            ref="adm_spcli_obs"
                                            value={adm_spcli_obs}
                                            maxLength={100}
                                            onChange={this.onInputChange}
                                            multiline={true}
                                            height={150}
                                        />

                                        <Button
                                            title="OK"
                                            onPress={() => { this.onOBSPress(!this.state.modalOBSVisible) }}
                                            buttonStyle={{ marginTop: 15, height: 35 }}
                                            backgroundColor={Colors.buttonPrimary}
                                            icon={{
                                                name: 'filter',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>



                    <ProgressDialog
                        visible={carregarRegistro}
                        title="SIGA PRO"
                        message="Carregando. Aguarde..."
                    />
                    <ProgressDialog
                        visible={salvando}
                        title="SIGA PRO"
                        message="Salvando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}