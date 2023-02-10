// CREATED BY MAYK FELIX 08/02/2023
import {Pressable, View, SafeAreaView} from "react-native";
import {Header, Icon, Text} from "react-native-elements";
import React, {PureComponent} from 'react';

export default class HeaderComponent extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            color: props?.color || '#1F829C',
        }
    }


    render() {
        const {navigation} = this.props;
        return (
            <Header
                innerContainerStyles={{
                    backgroundColor: 'transparent'
                }}
                outerContainerStyles={{
                    backgroundColor: '#1F829C',
                    width: '100%',
                    height: 55,
                }}
                // backgroundColor={'white'}
                // placement="left"
                leftComponent={(
                    <Pressable
                        onPress={() => this?.props?.pressLeftComponen()}
                        style={{
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            // height: 20,
                        }}>
                        <Icon name={this?.props?.iconLeftComponen} color={this?.state?.color} size={32}/>
                    </Pressable>
                )}
                centerComponent={(
                    <View style={{
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                        // height: 30,
                        // width: 200,
                    }}>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: '500',
                            color: this?.state?.color
                        }}>{this?.props?.titleCenterComponent}
                        </Text>
                    </View>
                )}
                // rightComponent={{icon: 'home', color: '#fff'}}
            />
        )
    }


}

// HeaderComponent.propTypes = {
//     iconLeftComponen: PropTypes.func,
//     pressLeftComponen: PropTypes.func
// };

HeaderComponent.defaultProps = {
    color: 'white',
    titleCenterComponent: '',
    iconLeftComponen: '',
    pressLeftComponen: undefined,
};