import React, { PureComponent } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import { Text, Divider } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';

import Icon from './Icon';
import Colors from '../values/Colors';
import { removeToken, removePermissoes, getTemPermissao, getUsuario, getFilial, getPermissoes, getEmpresa } from '../utils/LoginManager';

const DrawerItem = ({ text, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Text
                style={{
                    fontSize: 16,
                    padding: 10,
                    color: Colors.textPrimaryLight,
                }}
            >
                {text}
            </Text>
        </TouchableOpacity>
    )
}

class Drawer extends PureComponent {

    state = {
        permissoes: []
    };

    componentWillMount() {
        this.refreshUsuario();
    }

    componentWillReceiveProps() {
        this.refreshUsuario();
    }

    refreshUsuario = () => {
        getUsuario().then(usuario => {
            this.setState({ usuario });
        })
        getEmpresa().then(empresa => {
            this.setState({ empresa });
        })
        getPermissoes().then(permissoes => {
            this.setState({ permissoes });
        })
        getFilial().then(filial => {
            this.setState({ filial });
        })
    }

    onSair = async () => {
        await removeToken();
        await removePermissoes();
        this.replaceScreen("LoginScreen");
    }

    replaceScreen = (routeName) => {
        const { navigation } = this.props;
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: routeName })
            ]
        })
        navigation.dispatch(resetAction);
    }

    render() {
        const { navigation } = this.props;
        const { usuario, filial, empresa, permissoes } = this.state;
        if ((!usuario) || (!permissoes)) return null;

        // console.log('Drawer.state: ', this.state);
        // console.log('Drawer.permissoes: ', permissoes);
        // console.log('Drawer.getTemPermissao: ', getTemPermissao('VIAGENSTURISMOSCREEN', permissoes));

        return (
            <View style={{ flex: 1 }}>

                <View
                    style={{
                        height: 120,
                        padding: 16,
                        backgroundColor: Colors.primaryLight,
                        justifyContent: 'flex-end',
                        alignItems: 'flex-start',
                    }}>
                    <Icon
                        family="MaterialIcons"
                        name="person"
                        size={40}
                        color={Colors.textSecondaryLight}
                    />
                    <Text
                        style={{
                            fontSize: 14,
                            color: Colors.textSecondaryLight
                        }}
                    >
                        Usuário: {usuario.adm_pes_nome}
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: Colors.textSecondaryLight
                        }}
                    >
                        Filial: {filial}    {empresa ? 'Empresa: ' + String(empresa) : ''}
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>

                            {getTemPermissao('ESCALAVEICULOSSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Escala dos Veículos"
                                    onPress={() => navigation.navigate('EscalaVeiculosScreen')}
                                />
                            ) : null}

                            {empresa && getTemPermissao('FICHAVIAGEMSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Ficha de Viagem"
                                    onPress={() => navigation.navigate('FichaViagemScreen')}
                                />
                            ) : null}

                            {empresa && getTemPermissao('ORDENSSERVICOSSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Ordem de Serviço"
                                    onPress={() => navigation.navigate('OrdensServicosScreen')}
                                />
                            ) : null}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            {getTemPermissao('VIAGENSTURISMOSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Viagens Turismo"
                                    onPress={() => navigation.navigate('ViagensTurismoScreen')}
                                />
                            ) : null}

                            {getTemPermissao('VEICULOSSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Veículos"
                                    onPress={() => navigation.navigate('VeiculosScreen')}
                                />
                            ) : null}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            {empresa && getTemPermissao('FICHAESTOQUESCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Ficha do Estoque"
                                    onPress={() => navigation.navigate('FichaEstoqueScreen')}
                                />
                            ) : null}

                            {empresa && getTemPermissao('CONSULTAITENSESTOQUESCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Consultar Produto"
                                    onPress={() => navigation.navigate('ConsultaItensEstoqueScreen')}
                                />
                            ) : null}

                            {empresa && getTemPermissao('MOVESTOQUESCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Consulta Mov. Estoque"
                                    onPress={() => navigation.navigate('MovEstoqueScreen')}
                                />
                            ) : null}

                            {empresa && getTemPermissao('SAIDASESTOQUECREEN', permissoes) ? (
                                <DrawerItem
                                    text="Baixa do Estoque"
                                    onPress={() => navigation.navigate('SaidasEstoqueScreen')}
                                />
                            ) : null}

                            {empresa && getTemPermissao('SAIDASDIESELCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Baixa de Diesel/Arla"
                                    onPress={() => navigation.navigate('SaidasDieselScreen')}
                                />
                            ) : null}

                            {empresa && getTemPermissao('SOLICITACOESESTOQUESCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Solicitações Estoque Filiais"
                                    onPress={() => navigation.navigate('SolicitacoesEstoqueScreen')}
                                />
                            ) : null}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            {empresa && getTemPermissao('MEDICOESTANQUESDIESELCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Medir Tanque Diesel"
                                    onPress={() => navigation.navigate('MedicoesTanqueDieselScreen')}
                                />
                            ) : null}

                            {empresa && getTemPermissao('MEDICOESTANQUEARLASCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Medir Tanque Arla"
                                    onPress={() => navigation.navigate('MedicoesTanqueArlaScreen')}
                                />
                            ) : null}

                            {empresa && getTemPermissao('PREDIGITACAONOTASSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Pré-Digitar NFe"
                                    onPress={() => navigation.navigate('PreDigitacaoNotasScreen')}
                                />
                            ) : null}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            {getTemPermissao('PNEUSLOCALIZARSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Localizar Pneus"
                                    onPress={() => navigation.navigate('PneusLocalizarScreen')}
                                />
                            ) : null}

                            {getTemPermissao('PNEUSVEICULOSSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Pneus nos Veículos"
                                    onPress={() => navigation.navigate('PneusVeiculosScreen')}
                                />
                            ) : null}

                            {getTemPermissao('PNEUSVEICULOSSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Pneus em Estoque"
                                    onPress={() => navigation.navigate('PneusEstoqueScreen')}
                                />
                            ) : null}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            {getTemPermissao('SALDOSFILIAISSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Saldo das Filiais"
                                    onPress={() => navigation.navigate('SaldosFiliaisScreen')}
                                />
                            ) : null}

                            {getTemPermissao('AUTORIZACAODESPESASSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Autorização de Despesas"
                                    onPress={() => navigation.navigate('AutorizacaoDespesasScreen')}
                                />
                            ) : null}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            {getTemPermissao('TROCARFILIALSCREEN', permissoes) ? (
                                <DrawerItem
                                    text="Trocar Filial"
                                    onPress={() => navigation.navigate('TrocarFilialScreen')}
                                />
                            ) : null}

                            <DrawerItem
                                text="Trocar Senha"
                                onPress={() => navigation.navigate('TrocarSenhaScreen')}
                            />

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            <DrawerItem text="Sair" onPress={this.onSair} />
                        </View>
                    </ScrollView>
                </View>

            </View>
        )
    }
}

export default Drawer;
