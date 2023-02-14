import React, {Component} from 'react';
import {View, Text, Platform, Image, TouchableOpacity} from 'react-native';

import {
    withNavigation, createAppContainer,
} from 'react-navigation';

import {createStackNavigator} from 'react-navigation-stack';
import {createDrawerNavigator} from 'react-navigation-drawer';


import SplashScreen from './SplashScreen';
import BemVindoScreen from './BemVindoScreen';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import TrocarFilialScreen from './TrocarFilialScreen';

import EscalaVeiculoScreen from './EscalaVeiculoScreen';
import EscalaVeiculosScreen from './EscalaVeiculosScreen';
import EscalaVeiculoLogScreen from './EscalaVeiculoLogScreen';

import CheckListScreen from './CheckListScreen';
import CheckListItemScreen from './CheckListItemScreen';

import RefeicoesScreen from './RefeicoesScreen';
import RefeicaoScreen from './RefeicaoScreen';

import OrdensServicosScreen from './OrdensServicosScreen';
import OrdemServicoScreen from './OrdemServicoScreen';
import OrdemServicoCorretivoScreen from './OrdemServicoCorretivoScreen';
import OrdemServicoPreventivoScreen from './OrdemServicoPreventivoScreen';
import OrdemServicoPecasScreen from './OrdemServicoPecasScreen';
import OrdemServicoResponsaveisScreen from './OrdemServicoResponsaveisScreen';
import OrdemServicoDefeitosConstScreen from './OrdemServicoDefeitosConstScreen';
import OrdemServicoServPendenteScreen from './OrdemServicoServPendenteScreen';

import VeiculosScreen from './VeiculosScreen';
import RestaurantesScreen from './RestaurantesScreen';

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
import SaidaDieselScreen from "./SaidaDIeselScreen";
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
import {Header} from "react-native-elements";

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
    const {navigation} = props;
    return (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon family="MaterialIcons"
                  name="menu"
                  color={Colors.textOnPrimary}
                  style={{padding: 16}}/>
        </TouchableOpacity>
    )
})

const HomeStackNavigator = createStackNavigator({
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
            // headerShown: false,
            title: "Login",
            ...defaultNavigationOptions
        }
    },
    TrocarFilialScreen: {
        screen: TrocarFilialScreen,
        navigationOptions: {
            headerShown: false,
            title: "Trocar de Filial",
            ...defaultNavigationOptions
        }
    },
    HomeScreen: {
        screen: HomeScreen,
        navigationOptions: {
            title: "Home",
            // headerLeft: () => <MenuButton />,
            headerShown: false,
            ...defaultNavigationOptions,
            drawerLockMode: 'unlocked',
        }
    },


    EscalaVeiculoScreen: {
        screen: EscalaVeiculoScreen,
        navigationOptions: {
            headerShown: false,
            title: "Detalhes da Escala",
            ...defaultNavigationOptions,
        }
    },
    EscalaVeiculosScreen: {
        screen: EscalaVeiculosScreen,
        navigationOptions: {
            headerShown: false,
            title: "Escala dos Veículos",
            ...defaultNavigationOptions
        }
    },
    EscalaVeiculoLogScreen: {
        screen: EscalaVeiculoLogScreen,
        navigationOptions: {
            headerShown: false,
            title: "Log das Alterações",
            ...defaultNavigationOptions
        }
    },


    CheckListScreen: {
        screen: CheckListScreen,
        navigationOptions: {
            headerShown: false,
            title: "Check-List dos Veículos",
            ...defaultNavigationOptions
        }
    },
    CheckListItemScreen: {
        screen: CheckListItemScreen,
        navigationOptions: {
            headerShown: false,
            title: "Check-List",
            ...defaultNavigationOptions
        }
    },


    RefeicoesScreen: {
        screen: RefeicoesScreen,
        navigationOptions: {
            headerShown: false,
            title: "Refeições",
            ...defaultNavigationOptions
        }
    },
    RefeicaoScreen: {
        screen: RefeicaoScreen,
        navigationOptions: {
            headerShown: false,
            title: "Refeição",
            ...defaultNavigationOptions
        }
    },


    OrdensServicosScreen: {
        screen: OrdensServicosScreen,
        navigationOptions: {
            headerShown: false,
            title: "Ordens de Serviços",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoScreen: {
        screen: OrdemServicoScreen,
        navigationOptions: {
            headerShown: false,
            title: "Ordem Serviço",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoCorretivoScreen: {
        screen: OrdemServicoCorretivoScreen,
        navigationOptions: {
            headerShown: false,
            title: "Serviços Corretivos",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoPreventivoScreen: {
        screen: OrdemServicoPreventivoScreen,
        navigationOptions: {
            headerShown: false,
            title: "Serviços Preventivos",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoPecasScreen: {
        screen: OrdemServicoPecasScreen,
        navigationOptions: {
            headerShown: false,
            title: "Peças Utilizadas",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoResponsaveisScreen: {
        screen: OrdemServicoResponsaveisScreen,
        navigationOptions: {
            headerShown: false,
            title: "Responsáveis",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoDefeitosConstScreen: {
        screen: OrdemServicoDefeitosConstScreen,
        navigationOptions: {
            headerShown: false,
            title: "Defeitos Constatados",
            ...defaultNavigationOptions
        }
    },
    OrdemServicoServPendenteScreen: {
        screen: OrdemServicoServPendenteScreen,
        navigationOptions: {
            headerShown: false,
            title: "Serviços Pendentes",
            ...defaultNavigationOptions
        }
    },


    VeiculosScreen: {
        screen: VeiculosScreen,
        navigationOptions: {
            headerShown: false,
            title: "Lista dos Veículos",
            ...defaultNavigationOptions
        }
    },


    RestaurantesScreen: {
        screen: RestaurantesScreen,
        navigationOptions: {
            headerShown: false,
            title: "Lista dos Restaurantes",
            ...defaultNavigationOptions
        }
    },


    PneusLocalizarScreen: {
        screen: PneusLocalizarScreen,
        navigationOptions: {
            headerShown: false,
            title: "Localizar Pneu",
            ...defaultNavigationOptions
        }
    },

    PneusTrocaScreen: {
        screen: PneusTrocaScreen,
        navigationOptions: {
            headerShown: false,
            title: "Trocar Pneu",
            ...defaultNavigationOptions
        }
    },

    PneusVeiculosScreen: {
        screen: PneusVeiculosScreen,
        navigationOptions: {
            headerShown: false,
            title: "Pneus nos Veículos",
            ...defaultNavigationOptions
        }
    },

    PneusEstoqueScreen: {
        screen: PneusEstoqueScreen,
        navigationOptions: {
            headerShown: false,
            title: "Pneus em Estoque",
            ...defaultNavigationOptions
        }
    },

    PneusSulcagemScreen: {
        screen: PneusSulcagemScreen,
        navigationOptions: {
            headerShown: false,
            title: "Sulcagem",
            ...defaultNavigationOptions
        }
    },


    FichaEstoqueScreen: {
        screen: FichaEstoqueScreen,
        navigationOptions: {
            headerShown: false,
            title: "Ficha do Estoque",
            ...defaultNavigationOptions,
        }
    },

    ConsultaItensEstoqueScreen: {
        screen: ConsultaItensEstoqueScreen,
        navigationOptions: {
            headerShown: false,
            title: "Consultar Produto",
            ...defaultNavigationOptions,
        }
    },

    MovEstoqueScreen: {
        screen: MovEstoqueScreen,
        navigationOptions: {
            headerShown: false,
            title: "Consulta Mov. Estoque",
            ...defaultNavigationOptions,
        }
    },


    SaidasEstoqueScreen: {
        screen: SaidasEstoqueScreen,
        navigationOptions: {
            headerShown: false,
            title: "Baixas do Estoque",
            ...defaultNavigationOptions,
        }
    },
    SaidaEstoqueScreen: {
        screen: SaidaEstoqueScreen,
        navigationOptions: {
            headerShown: false,
            title: "Baixa do Estoque",
            ...defaultNavigationOptions,
        }
    },
    SaidaEstoqueItensScreen: {
        screen: SaidaEstoqueItensScreen,
        navigationOptions: {
            headerShown: false,
            title: "Itens da Baixa",
            ...defaultNavigationOptions,
        }
    },


    SaidasDieselScreen: {
        screen: SaidasDieselScreen,
        navigationOptions: {
            headerShown: false,
            title: "Baixas de Diesel/Arla",
            ...defaultNavigationOptions,
        }
    },
    SaidaDieselScreen: {
        screen: SaidaDieselScreen,
        navigationOptions: {
            headerShown: false,
            title: "Baixa de Diesel/Arla",
            ...defaultNavigationOptions,
        }
    },
    SaidaDieselItensScreen: {
        screen: SaidaDieselItensScreen,
        navigationOptions: {
            headerShown: false,
            title: "Diesel/Arla",
            ...defaultNavigationOptions,
        }
    },


    SolicitacoesEstoqueScreen: {
        screen: SolicitacoesEstoqueScreen,
        navigationOptions: {
            headerShown: false,
            title: "Solicitações Filiais",
            ...defaultNavigationOptions,
        }
    },
    SolicitacaoEstoqueScreen: {
        screen: SolicitacaoEstoqueScreen,
        navigationOptions: {
            headerShown: false,
            title: "Solicitação de Estoque",
            ...defaultNavigationOptions,
        }
    },
    SolicitacaoEstoqueItensScreen: {
        screen: SolicitacaoEstoqueItensScreen,
        navigationOptions: {
            headerShown: false,
            title: "Itens da Solicitação",
            ...defaultNavigationOptions,
        }
    },


    MedicoesTanqueDieselScreen: {
        screen: MedicoesTanqueDieselScreen,
        navigationOptions: {
            headerShown: false,
            title: "Medições do Tanque Diesel",
            ...defaultNavigationOptions,
        }
    },
    MedicaoTanqueDieselScreen: {
        screen: MedicaoTanqueDieselScreen,
        navigationOptions: {
            headerShown: false,
            title: "Medir Tanque Diesel",
            ...defaultNavigationOptions
        }
    },

    MedicoesTanqueArlaScreen: {
        screen: MedicoesTanqueArlaScreen,
        navigationOptions: {
            headerShown: false,
            title: "Medições do Tanque Arla",
            ...defaultNavigationOptions,
        }
    },
    MedicaoTanqueArlaScreen: {
        screen: MedicaoTanqueArlaScreen,
        navigationOptions: {
            headerShown: false,
            title: "Medir Tanque Arla",
            ...defaultNavigationOptions
        }
    },

    FichaViagemScreen: {
        screen: FichaViagemScreen,
        navigationOptions: {
            headerShown: false,
            title: "Ficha de Viagem",
            ...defaultNavigationOptions
        }
    },

    ViagensTurismoScreen: {
        screen: ViagensTurismoScreen,
        navigationOptions: {
            headerShown: false,
            title: "Viagens Turismo",
            ...defaultNavigationOptions
        }
    },

    SaldosFiliaisScreen: {
        screen: SaldosFiliaisScreen,
        navigationOptions: {
            headerShown: false,
            title: "Saldo das Filiais",
            ...defaultNavigationOptions
        }
    },

    AutorizacaoDespesasScreen: {
        screen: AutorizacaoDespesasScreen,
        navigationOptions: {
            headerShown: false,
            title: "Autorização de Despesas",
            ...defaultNavigationOptions
        }
    },

    AutorizacaoDespesaScreen: {
        screen: AutorizacaoDespesaScreen,
        navigationOptions: {
            headerShown: false,
            title: "Autorização de Despesa",
            ...defaultNavigationOptions
        }
    },

    BoletinsDiferencaScreen: {
        screen: BoletinsDiferencaScreen,
        navigationOptions: {
            headerShown: false,
            title: "Boletins de Diferença",
            ...defaultNavigationOptions
        }
    },

    TrocarSenhaScreen: {
        screen: TrocarSenhaScreen,
        navigationOptions: {
            headerShown: false,
            title: "Trocar Senha",
            ...defaultNavigationOptions
        }
    },

    PreDigitacaoNotasScreen: {
        screen: PreDigitacaoNotasScreen,
        navigationOptions: {
            headerShown: false,
            title: "NFEs Pré-Digitadas",
            ...defaultNavigationOptions
        }
    },
    PreDigitacaoNotaScreen: {
        screen: PreDigitacaoNotaScreen,
        navigationOptions: {
            headerShown: false,
            title: "Pré-Digitação de NFEs",
            ...defaultNavigationOptions
        }
    },
    BarCodeScreen: {
        screen: BarCodeScreen,
        navigationOptions: {
            headerShown: false,
            title: "Escanear código de barras",
            header: () => null,
            ...defaultNavigationOptions
        }
    },


}, {
    headerMode: 'float',
    mode: 'modal',
    navigationOptions: {
        headerTitleAlign: 'center',
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
    },
});


const HomeDrawerNavigator = createDrawerNavigator(
    {
        HomeStack: {
            screen: HomeStackNavigator
        }
    },
    {
        contentComponent: Drawer,
    }
)

export default createAppContainer(HomeDrawerNavigator);
