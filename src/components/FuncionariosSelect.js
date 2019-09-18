import React, { PureComponent } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import TextInput from '../components/TextInput';

class FuncionariosSelect extends PureComponent {
    state = {
        funcionarios: [],
        codFunc: '',
        empFunc: '',
        nomeFunc: '',
        carregando: false
    };

    componentDidUpdate(propsAnterior, stateAnterior) {
        const { codFunc, onChange, id } = this.props;
        if (codFunc !== propsAnterior.codFunc) {
            this.setState({
                codFunc,
            })
            onChange(id,  null);
            if (codFunc) {
                this.buscaRegistros(codFunc);
            }
        }
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        clearTimeout(this.buscaRegistrosId);
        this.buscaRegistrosId = setTimeout(() => {
            this.buscaRegistros(value);
        }, 1000);
    }

    onInputChangeLista = (inputId, value) => {
        const { onChange, id } = this.props;
        onChange(id, value);
        this.setState({ nomeFunc: value });
    }

    buscaRegistros = (value) => {
        this.setState({ funcionarios: [] });
        const { id, onChange } = this.props;

        this.setState({ carregando: true });
        axios.get('/listaFuncionarios', {
            params: {
                ativo: 'S',
                codFunc: value
            }
        }).then(response => {
            const { data } = response;

            if (data) {
                const funcionarios = data.map(regList => {
                    return {
                        key: regList.rh_func_codigo + '_' + regList.rh_func_empresa,
                        label: regList.adm_pes_nome
                    }
                });

                if ((funcionarios) && (funcionarios.length > 0)) {
                    onChange(id, funcionarios[0].key)
                }

                this.setState({
                    funcionarios,
                    carregando: false,
                })
            } else {
                onChange(id, null)
                this.setState({
                    funcionarios: [],
                    carregando: false,
                })
            }

        }).catch(error => {
            console.warn(error.response);
            this.setState({
                carregando: false,
            });
        })
    }


    render() {
        const { label, value } = this.props;
        const { codFunc, nomeFunc, funcionarios, carregando } = this.state;

        // if (value) {
        //     this.setState({
        //         nomeFunc: value,
        //     });
        // }

        return (
            <View style={{ flexDirection: 'row' }} >
                <View style={{ width: "25%" }}>
                    <TextInput
                        label={label}
                        id="codFunc"
                        ref="codFunc"
                        value={codFunc}
                        maxLength={6}
                        keyboardType="numeric"
                        onChange={this.onInputChange}
                    />
                </View>

                <View style={{ width: "75%" }}>
                    {carregando
                        ? (
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <ActivityIndicator style={{ margin: 10 }} />
                                <Text> Buscando... </Text>
                            </View>
                        ) : (
                            <TextInput
                                type="select"
                                label=" "
                                id="nomeFunc"
                                ref="nomeFunc"
                                value={nomeFunc}
                                selectedValue=""
                                options={funcionarios}
                                onChange={this.onInputChangeLista}
                                required={true}
                                errorMessage="Selecione um Funcionário"
                            />
                        )
                    }

                </View>
            </View >
        );
    }
}

export default FuncionariosSelect;
