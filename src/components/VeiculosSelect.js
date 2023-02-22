import React, {PureComponent} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import axios from 'axios';
import TextInput from '../components/TextInput';
import Colors from "../values/Colors";
import Alert from "./Alert";


class VeiculosSelect extends PureComponent {

    constructor(props){
        super(props)
        // console.log('onErro',props?.onErro)
    }

    state = {
        carregando: false,
        codVeiculo: '',
        msgErro: '',
    };

    componentDidUpdate(propsAnterior, stateAnterior) {
        const {codVeiculo, onChange, id} = this.props;

        if (codVeiculo !== propsAnterior.codVeiculo) {
            this.setState({
                codVeiculo,
            })
            onChange(id, null);
            if (codVeiculo) {
                this.buscaRegistros(codVeiculo);
            }
        }
    }

    onChange = (id, value) => {
        try {
            const state = {};
            state[id] = value;
            this.setState(state);
            clearTimeout(this.buscaRegistrosId);
            this.buscaRegistrosId = setTimeout(() => {
                this.buscaRegistros(value);
            }, 1000);
        } catch (e) {
            Alert.showAlert("Error catch onChange buscaRegistrosId")
        }
    };

    buscaRegistros = (value) => {
        try {
            this.setState({carregando: true});
            const {id, tipo, onChange} = this.props;

            let request;
            if (tipo === 'fichaSaida') {
                request = axios.get('/fichaViagem/buscaVeicSaida', {
                    params: {
                        ativo: 'S',
                        veiculo: value
                    }
                });
            } else if (tipo === 'fichaChegada') {
                request = axios.get('/fichaViagem/buscaVeicChegada', {
                    params: {
                        ativo: 'S',
                        veiculo: value
                    }
                });
            } else {
                request = axios.get('/listaVeiculos', {
                    params: {
                        ativo: 'S',
                        veiculo: value
                    }
                });
            }

            request.then(response => {
                const {data} = response;

                // console.log('VEICULO: ', data);

                if (data.msgErro === 'OK') {
                    this.setState({
                        msgErro: '',
                    })
                    onChange(id, data)
                    if(this?.props?.onErro){
                        this?.props?.onErro('');
                    }
                } else {
                    this.setState({
                        msgErro: data.msgErro,
                    })
                    onChange(id, null);
                    if (this?.props?.onErro) {
                        this?.props?.onErro(data.msgErro);
                    }
                }

                this.setState({
                    carregando: false,
                })
            }).catch(error => {
                const response = error;
                console.warn(response);
                this.setState({
                    carregando: false,
                });
            })

        } catch (error) {
            console.log(error.response);
            this.setState({
                carregando: false,
            });
            Alert.showAlert("Error :" + error.response)
        }
    };


    render() {
        const {label, value, enabled} = this.props;
        const {codVeiculo, msgErro, carregando} = this.state;

        let descricao;
        if (msgErro) {
            descricao = msgErro
        } else if (value) {
            descricao = value.adm_vei_placa + ' - ' + value.adm_veimarca_descricao_chassi;
        }

        return (
            <View style={{flexDirection: 'row'}}>
                <View style={{width: "25%"}}>
                    <TextInput
                        label={label}
                        id="codVeiculo"
                        ref="codVeiculo"
                        value={codVeiculo}
                        maxLength={9}
                        keyboardType="numeric"
                        onChange={this.onChange}
                        enabled={enabled}
                    />
                </View>

                <View style={{width: "75%"}}>

                    {carregando ?
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            position: 'absolute',
                            // backgroundColor: 'white',
                            width: '100%',
                            maxWidth: 280
                        }}>
                            <ActivityIndicator style={{margin: 10}} color={Colors.mediumGray}/>
                            <Text> Buscando... </Text>
                        </View>
                        : null}

                    <TextInput
                        label=" "
                        value={carregando ? '' : descricao}
                        enabled={false}
                    />


                </View>
            </View>
        );
    }
}

export default VeiculosSelect;
