import React, { PureComponent } from 'react';
import {
    View,
    TextInput as TI,
    Picker
} from 'react-native';

import {
    Text
} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';

import Colors from '../values/Colors';

class TextInput extends PureComponent {

    state = { valid: null };

    onChange = (text) => {
        const { validator, masker, id, onChange } = this.props;
        if (masker) {
            text = masker(text);
        }
        if (validator) {
            this.setState({ valid: !!validator(text) });
        }
        onChange(id, text);
    }

    isValid = () => {
        if (!this.props.required)
            return true;

        const { validator, value } = this.props;
        let valid = false;
        if (validator) {
            valid = !!validator(value);
        } else {
            valid = !!value;
        }
        this.setState({ valid });

        return valid;
    }

    render() {
        const { label, id, errorMessage, type, dateFormat, validator, value, data,
            required, onChange, editable, secureTextEntry, keyboardType, autoCapitalize,
            style, itemStyle, itemTextStyle, multiline, numberOfLines, onBlur, enabled,
            options = [], iniciarVazio, placeholder, minDate, maxDate, fontSize, 
            maxLength, height, borderWidth, textAlign, ...others } = this.props;
        const { valid } = this.state;

        const borderColor = valid === false ? 'red' : Colors.accent;

        let CustomInput;

        if ((type === 'date') || (type === 'time') || (type === 'datetime')) {
            CustomInput = (
                <View style={{
                    borderBottomWidth: borderWidth === 0 ? 0 : 1,
                    borderLeftWidth: borderWidth === 0 ? 0 : 1,
                    margin: 0,
                    padding: 0,
                    borderColor: Colors.textSecondaryDark,
                }}>
                    {label ? (
                        <Text
                            style={{
                                color: Colors.textSecondaryDark,
                                fontSize: 12,
                                marginLeft: 3,
                                marginBottom: 0,
                            }}>
                            {label}
                        </Text>
                    ) : null}

                    <View style={{
                        paddingBottom: 2,
                        paddingLeft: 16,
                    }}>

                        <DatePicker
                            ref="TextInput"
                            mode={type}
                            date={value}
                            onDateChange={this.onChange}
                            format={dateFormat}
                            minDate={minDate}
                            maxDate={maxDate}
                            confirmBtnText="Confirmar"
                            cancelBtnText="Cancelar"
                            showIcon={true}
                            is24Hour={true}
                            style={{
                                width: '100%',
                            }}
                            disabled={editable === false}
                            customStyles={{
                                dateInput: {
                                    width: '100%',
                                    alignItems: "flex-start",
                                    fontSize: 18,
                                    height: 25,
                                    backgroundColor: "transparent",
                                    borderColor: borderColor,
                                    borderTopWidth: 0,
                                    borderBottomWidth: 0,
                                    borderLeftWidth: 0,
                                    borderRightWidth: 0,
                                    ...style
                                },
                                disabled: {
                                    backgroundColor: "transparent",
                                    height: 25,
                                    borderRadius: 2,
                                },
                                dateText: {
                                    fontSize: fontSize,
                                    color: Colors.textPrimaryDark,
                                },
                                dateTouchBody: {
                                    flex: 1, width: '100%', height: 25,
                                },
                                placeholderText: {
                                    color: Colors.textHintDark,
                                    fontSize: 14,
                                },
                                btnTextConfirm: {
                                    color: Colors.accent,
                                    fontWeight: 'bold',
                                },
                                btnTextCancel: {
                                    color: Colors.accentLight,
                                }
                            }}
                        />
                    </View>
                </View>
            )

        } else if (type === "select") {
            const pickerItems = [];
            if (iniciarVazio) {
                pickerItems.push(<Picker.Item key={0} label="Todos" value={0} />);
            }
            options.forEach((i, index) => (
                pickerItems.push(<Picker.Item key={index + 1} label={i.label} value={i.key} />)
            ))
            CustomInput = (
                <View style={{
                    borderBottomWidth: borderWidth === 0 ? 0 : 1,
                    borderLeftWidth: borderWidth === 0 ? 0 : 1,
                    borderColor: Colors.textSecondaryDark,
                }}>
                    {label ? (
                        <Text
                            style={{
                                color: Colors.textSecondaryDark,
                                fontSize: 12,
                                marginLeft: 3,
                            }}
                        >
                            {label}
                        </Text>
                    ) : null}

                    <View style={{
                        paddingBottom: 2,
                        paddingLeft: 10,
                    }}>
                        <Picker
                            note
                            mode="dropdown"
                            selectedValue={value}
                            onValueChange={this.onChange}
                            enabled={enabled}

                            style={{
                                width: '100%',
                                color: Colors.textPrimaryDark,
                                height: height ? height : 25,
                                minHeight: 25,
                                ...style
                            }}

                            textStyle={{

                            }}

                            itemStyle={{

                                ...itemStyle
                            }}

                            itemTextStyle={{

                                ...itemTextStyle
                            }}

                        >
                            {pickerItems}
                        </Picker>
                    </View>
                </View>
            )

        } else {
            const strValue = typeof value === 'number' ? String(value) : value;
            CustomInput = (
                <View style={{
                    borderBottomWidth: 1,
                    borderLeftWidth: 1,
                    margin: 0,
                    padding: 0,
                }}>
                    {label ? (
                        <Text
                            style={{
                                color: Colors.textSecondaryDark,
                                fontSize: 12,
                                marginLeft: 3,
                            }}>
                            {label}
                        </Text>
                    ) : null}

                    <TI ref="TextInput"
                        secureTextEntry={secureTextEntry}
                        underlineColorAndroid={Colors.transparent}
                        placeholder={placeholder}
                        placeholderTextColor={Colors.textHintDark}
                        value={strValue} 
                        editable={editable}
                        onChangeText={this.onChange}
                        autoCapitalize={autoCapitalize}
                        keyboardType={keyboardType}
                        multiline={multiline}
                        numberOfLines={numberOfLines}
                        onBlur={onBlur}
                        editable={enabled}
                        maxLength={maxLength}
                        style={{
                            width: '100%',
                            height: height ? height : 27,
                            paddingLeft: 10,
                            paddingBottom: 2,
                            paddingTop: 0,
                            fontSize: fontSize,
                            color: Colors.textPrimaryDark,
                            borderColor: borderColor,
                            borderWidth: 0,
                            borderRadius: 2,
                            ...style
                        }} />
                </View>
            )
        }

        return (
            <View style={{ width: '100%' }}>

                {CustomInput}

                <Text style={{ color: 'red' }}>{valid === false ? errorMessage : ''}</Text>
            </View>
        )
    }
}

export default TextInput;