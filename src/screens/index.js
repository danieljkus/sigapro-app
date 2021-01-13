import React, { Component } from 'react';
import { View, Text, Platform, Image, TouchableOpacity } from 'react-native';

import { StackNavigator, DrawerNavigator, withNavigation } from 'react-navigation';

import SplashScreen from './SplashScreen';
import BemVindoScreen from './BemVindoScreen';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import TrocarFilialScreen from './TrocarFilialScreen';

import EscalaVeiculoScreen from './EscalaVeiculoScreen';
import EscalaVeiculosScreen from './EscalaVeiculosScreen';
import EscalaVeiculoLogScreen from './EscalaVeiculoLogScreen';

import OrdensServicosScreen from './OrdensServicosScreen';
import OrdemServicoScreen from './OrdemServicoScreen';
import OrdemServicoCorretivoScreen from './OrdemServicoCorretivoScreen';
import OrdemServicoPreventivoScreen from './OrdemServicoPreventivoScreen';
import OrdemServicoPecasScreen from './OrdemServicoPecasScreen';
import OrdemServicoResponsaveisScreen from './OrdemServicoResponsaveisScreen';
import OrdemServicoDefeitosConstScreen from './OrdemServicoDefeitosConstScreen';
import OrdemServicoServPendenteScreen from './OrdemServicoServPendenteScreen';

import VeiculosScreen from './VeiculosScreen';

import PneusLocalizarScreen from './PneusLocalizarScreen';
import PneusTrocaScreen from './PneusTrocaScreen';
import PneusVeiculosScreen from './PneusVeiculosScreen';
import PneusEstoqueScreen from './PneusEstoqueScreen';
import PneusSulcagemScreen from './PneusSulcagemScreen';

import MedicaoTanqueDieselScreen from './MedicaoTanqueDieselScreen';
import MedicoesTanqueDieselScreen from './MedicoesTanqueDieselScreen';

import FichaEstoqueScreen from './FichaEstoqueScreen';
import ConsultaItensEstoqueScreen from './ConsultaItensEstoqueScreen';
import MovEstoqueScreen from './MovEstoqueScreen';

import SaidasEstoqueScreen from './SaidasEstoqueScreen';
import SaidaEstoqueScreen from './SaidaEstoqueScreen';
import SaidaEstoqueItensScreen from './SaidaEstoqueItensScreen';

import SaidasDieselScreen from './SaidasDieselScreen';
import SaidaDieselScreen from './SaidaDieselScreen';
import SaidaDieselItensScreen from './SaidaDieselItensScreen';

import SolicitacoesEstoqueScreen from './SolicitacoesEstoqueScreen';
import SolicitacaoEstoqueScreen from './SolicitacaoEstoqueScreen';
import SolicitacaoEstoqueItensScreen from './SolicitacaoEstoqueItensScreen';

import MedicaoTanqueArlaScreen from './MedicaoTanqueArlaScreen';
import MedicoesTanqueArlaScreen from './MedicoesTanqueArlaScreen';

import PreDigitacaoNotaScreen from './PreDigitacaoNotaScreen';
import PreDigitacaoNotasScreen from './PreDigitacaoNotasScreen';
import BarCodeScreen from '../components/BarCodeScreen';

import FichaViagemScreen from './FichaViagemScreen';

import ViagensTurismoScreen from './ViagensTurismoScreen';

import SaldosFiliaisScreen from './SaldosFiliaisScreen';
import AutorizacaoDespesasScreen from './AutorizacaoDespesasScreen';
import AutorizacaoDespesaScreen from './AutorizacaoDespesaScreen';

import BoletinsDiferencaScreen from './BoletinsDiferencaScreen';

import TrocarSenhaScreen from './TrocarSenhaScreen';

import Icon from '../components/Icon';
import Drawer from '../components/Drawer';
import Colors from '../values/Colors';

import HeaderBackButton from 'react-navigation/src/views/Header/HeaderBackButton'

const defaultNavigationOptions = Platform.select({
    ios: {
        headerTintColor: Colors.primary,
        headerTitleStyle: {
            color: Colors.textPrimaryDark,
        }
    }, android: {
        headerTintColor: Colors.textOnPrimary,
        headerStyle: {
            backgroundColor: Colors.primary
        },
    }
});
defaultNavigationOptions.headerBackTitle = "Voltar";
defaultNavigationOptions.drawerLockMode = 'locked-closed';

const MenuButton = withNavigation((props) => {
    const { navigation } = props;
    return (
        <TouchableOpacity onPress={() => navigation.navigate('DrawerOpen')}>
            <Icon family="MaterialIcons"
                name="menu"
                color={Colors.textOnPrimary}
                style={{ padding: 16 }} />
        </TouchableOpacity>
    )
})

const HomeStackNavigator = StackNavigator({
    SplashScreen: {
        screen: SplashScreen,
        navigationOptions: {
            header: () => null,
            ...defaultNavigationOptions
        }
    },
    BemVindoScreen: {
        screen: BemVindoScreen,
        navigationOptions: {
            header: () => null,
            ...defaultNavigationOptions
        }
    },
    LoginScreen: {
        screen: LoginScreen,
        navigationOptions: {
            title: "Login",
            ...defaultNavigationOptions
        }
    },
    TrocarFilialScreen: {
        screen: TrocarFilialScreen,
        navigationOptions: {
            title: "Trocar de Filial",
            ...defaultNavigationOptions
        }
    },
    HomeScreen: {
        screen: HomeScreen,
        navigationOptions: {
            title: "Home",
            headerLeft: <MenuButton />,
            ...defaultNavigationOptions,
            drawerLockMode: 'unlocked',
        }
    },




    EscalaVeiculoScreen: {
        screen: EscalaVeiculoScreen,
        navigationOptions: {
            title: "Detalhes da Escala",
            ...defaultNavigationOptions,
        }
    },
    EscalaVeiculosScreen: {
        screen: EscalaVeiculosScreen,
        navigationOptions: {
            title: "Escala dos Veículos",
            ...defaultNavigationOptions
        }
    },
    EscalaVeiculoLogScreen: {
        screen: EscalaVeiculoLogScreen,
        navigationOptions: {
            title: "Log das Alterações",
            ...defaultNavigationOptions
        }
    },



    OrdensServicosScreen: {
        screen: OrdensServicosScreen,
        navigationOptions: {
            title: "Ordens de Serviços",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoScreen: {
        screen: OrdemServicoScreen,
        navigationOptions: {
            title: "Ordem Serviço",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoCorretivoScreen: {
        screen: OrdemServicoCorretivoScreen,
        navigationOptions: {
            title: "Serviços Corretivos",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoPreventivoScreen: {
        screen: OrdemServicoPreventivoScreen,
        navigationOptions: {
            title: "Serviços Preventivos",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoPecasScreen: {
        screen: OrdemServicoPecasScreen,
        navigationOptions: {
            title: "Peças Utilizadas",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoResponsaveisScreen: {
        screen: OrdemServicoResponsaveisScreen,
        navigationOptions: {
            title: "Responsáveis",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoDefeitosConstScreen: {
        screen: OrdemServicoDefeitosConstScreen,
        navigationOptions: {
            title: "Defeitos Constatados",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoServPendenteScreen: {
        screen: OrdemServicoServPendenteScreen,
        navigationOptions: {
            title: "Serviços Pendentes",
            ...defaultNavigationOptions
        }
    },




    VeiculosScreen: {
        screen: VeiculosScreen,
        navigationOptions: {
            title: "Lista dos Veículos",
            ...defaultNavigationOptions
        }
    },



    PneusLocalizarScreen: {
        screen: PneusLocalizarScreen,
        navigationOptions: {
            title: "Localizar Pneu",
            ...defaultNavigationOptions
        }
    },

    PneusTrocaScreen: {
        screen: PneusTrocaScreen,
        navigationOptions: {
            title: "Trocar Pneu",
            ...defaultNavigationOptions
        }
    },

    PneusVeiculosScreen: {
        screen: PneusVeiculosScreen,
        navigationOptions: {
            title: "Pneus nos Veículos",
            ...defaultNavigationOptions
        }
    },

    PneusEstoqueScreen: {
        screen: PneusEstoqueScreen,
        navigationOptions: {
            title: "Pneus em Estoque",
            ...defaultNavigationOptions
        }
    },

    PneusSulcagemScreen: {
        screen: PneusSulcagemScreen,
        navigationOptions: {
            title: "Sulcagem",
            ...defaultNavigationOptions
        }
    },



    FichaEstoqueScreen: {
        screen: FichaEstoqueScreen,
        navigationOptions: {
            title: "Ficha do Estoque",
            ...defaultNavigationOptions,
        }
    },

    ConsultaItensEstoqueScreen: {
        screen: ConsultaItensEstoqueScreen,
        navigationOptions: {
            title: "Consultar Produto",
            ...defaultNavigationOptions,
        }
    },

    MovEstoqueScreen: {
        screen: MovEstoqueScreen,
        navigationOptions: {
            title: "Consulta Mov. Estoque",
            ...defaultNavigationOptions,
        }
    },



    SaidasEstoqueScreen: {
        screen: SaidasEstoqueScreen,
        navigationOptions: {
            title: "Baixas do Estoque",
            ...defaultNavigationOptions,
        }
    },
    SaidaEstoqueScreen: {
        screen: SaidaEstoqueScreen,
        navigationOptions: {
            title: "Baixa do Estoque",
            ...defaultNavigationOptions,
        }
    },
    SaidaEstoqueItensScreen: {
        screen: SaidaEstoqueItensScreen,
        navigationOptions: {
            title: "Itens da Baixa",
            ...defaultNavigationOptions,
        }
    },


    SaidasDieselScreen: {
        screen: SaidasDieselScreen,
        navigationOptions: {
            title: "Baixas de Diesel/Arla",
            ...defaultNavigationOptions,
        }
    },
    SaidaDieselScreen: {
        screen: SaidaDieselScreen,
        navigationOptions: {
            title: "Baixa de Diesel/Arla",
            ...defaultNavigationOptions,
        }
    },
    SaidaDieselItensScreen: {
        screen: SaidaDieselItensScreen,
        navigationOptions: {
            title: "Diesel/Arla",
            ...defaultNavigationOptions,
        }
    },


    SolicitacoesEstoqueScreen: {
        screen: SolicitacoesEstoqueScreen,
        navigationOptions: {
            title: "Solicitações Filiais",
            ...defaultNavigationOptions,
        }
    },
    SolicitacaoEstoqueScreen: {
        screen: SolicitacaoEstoqueScreen,
        navigationOptions: {
            title: "Solicitação de Estoque",
            ...defaultNavigationOptions,
        }
    },
    SolicitacaoEstoqueItensScreen: {
        screen: SolicitacaoEstoqueItensScreen,
        navigationOptions: {
            title: "Itens da Solicitação",
            ...defaultNavigationOptions,
        }
    },


    MedicoesTanqueDieselScreen: {
        screen: MedicoesTanqueDieselScreen,
        navigationOptions: {
            title: "Medições do Tanque Diesel",
            ...defaultNavigationOptions,
        }
    },
    MedicaoTanqueDieselScreen: {
        screen: MedicaoTanqueDieselScreen,
        navigationOptions: {
            title: "Medir Tanque Diesel",
            ...defaultNavigationOptions
        }
    },

    MedicoesTanqueArlaScreen: {
        screen: MedicoesTanqueArlaScreen,
        navigationOptions: {
            title: "Medições do Tanque Arla",
            ...defaultNavigationOptions,
        }
    },
    MedicaoTanqueArlaScreen: {
        screen: MedicaoTanqueArlaScreen,
        navigationOptions: {
            title: "Medir Tanque Arla",
            ...defaultNavigationOptions
        }
    },

    FichaViagemScreen: {
        screen: FichaViagemScreen,
        navigationOptions: {
            title: "Ficha de Viagem",
            ...defaultNavigationOptions
        }
    },

    ViagensTurismoScreen: {
        screen: ViagensTurismoScreen,
        navigationOptions: {
            title: "Viagens Turismo",
            ...defaultNavigationOptions
        }
    },

    SaldosFiliaisScreen: {
        screen: SaldosFiliaisScreen,
        navigationOptions: {
            title: "Saldo das Filiais",
            ...defaultNavigationOptions
        }
    },

    AutorizacaoDespesasScreen: {
        screen: AutorizacaoDespesasScreen,
        navigationOptions: {
            title: "Autorização de Despesas",
            ...defaultNavigationOptions
        }
    },

    AutorizacaoDespesaScreen: {
        screen: AutorizacaoDespesaScreen,
        navigationOptions: {
            title: "Autorização de Despesa",
            ...defaultNavigationOptions
        }
    },

    BoletinsDiferencaScreen: {
        screen: BoletinsDiferencaScreen,
        navigationOptions: {
            title: "Boletins de Diferença",
            ...defaultNavigationOptions
        }
    },

    TrocarSenhaScreen: {
        screen: TrocarSenhaScreen,
        navigationOptions: {
            title: "Trocar Senha",
            ...defaultNavigationOptions
        }
    },

    PreDigitacaoNotasScreen: {
        screen: PreDigitacaoNotasScreen,
        navigationOptions: {
            title: "NFEs Pré-Digitadas",
            ...defaultNavigationOptions
        }
    },
    PreDigitacaoNotaScreen: {
        screen: PreDigitacaoNotaScreen,
        navigationOptions: {
            title: "Pré-Digitação de NFEs",
            ...defaultNavigationOptions
        }
    },
    BarCodeScreen: {
        screen: BarCodeScreen,
        navigationOptions: {
            title: "Escanear código de barras",
            header: () => null,
            ...defaultNavigationOptions
        }
    },


}, {
    headerMode: 'float',
    mode: 'modal',
    headerLayoutPreset: 'center',
    navigationOptions: {
        headerStyle: {
            backgroundColor: Colors.primary,
        },
        headerTitleStyle: {
            color: Colors.textOnPrimary
        },
        headerTintColor: Colors.textOnPrimary,
        headerBackTitleStyle: {
            color: Colors.textOnPrimary,
        },
        // headerLeft: (props) => {
        //     return <HeaderBackButton {...props} tintColor={Colors.textOnPrimary} />
        // }
    },
});



const HomeDrawerNavigator = DrawerNavigator(
    {
        HomeStack: {
            screen: HomeStackNavigator
        }
    },
    {
        contentComponent: Drawer,
    }
)

export default class AppNavigator extends Component {
    render() {
        return (
            <HomeDrawerNavigator />
        )
    }
}
