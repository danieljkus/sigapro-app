// CREATED BY MAYK FELIX 17/03/2023
import React, {useEffect, useState} from 'react'
import {View, Pressable, Text, Modal, DatePickerIOS} from 'react-native'
import DatePicker from 'react-native-date-picker';
import Colors from '../values/Colors';
import Button from "./Button";
import moment from 'moment';
import {formatDateBasic, formatDateValue} from "../utils/Maskers";

const DatePickerComponent = (props) => {
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);

    return (
        <View style={{}}>

            <Pressable onPress={() => setOpen(true)} style={{justifyContent: 'center'}} style={props?.style}>
                <Text style={{
                    fontSize: 18,
                }}>
                    {props?.mode === 'date' && ((props && props?.dateText) || moment(date).format("DD/MM/YYYY"))}
                    {props?.mode === 'datetime' && moment(date).format("DD/MM/YYYY")}
                    {props?.mode === 'time' && moment(date).format("HH:mm")}
                </Text>
            </Pressable>


            <Modal
                visible={open}
                onDismiss={() => setOpen(false)}
                onRequestClose={() => setOpen(false)}
                animationType={"slide"}
                transparent={true}
            >
                <Pressable
                    onPress={() => setOpen(false)}
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: 'rgba(0,0,0,0.5)',

                    }}>
                    <View style={{
                        paddingVertical: 15,
                        paddingHorizontal: 15,
                        backgroundColor: Colors.background,
                        borderRadius: 5,
                    }}>


                        <DatePicker
                            type={'default'}
                            date={date}
                            maximumDate={props?.maxDate}
                            minimumDate={props?.minDate}
                            mode={props?.mode}
                            showIcon={true}
                            is24Hour={true}
                            onDateChange={(newDate) => {
                                setDate(newDate);
                                if (props?.mode === 'date') {
                                    props?.onChange(formatDateBasic(newDate));
                                }
                                if (props?.mode === 'time') {
                                    props?.onChange(new Date(newDate));
                                }
                                if (props?.mode === 'datetime') {
                                    props?.onChange(new Date(newDate));
                                }
                            }}
                        />

                        <View style={{marginTop: 4, paddingVertical: 10, backgroundColor: Colors.transparent}}>
                            <Button
                                title="FECHAR"
                                onPress={() => setOpen(false)}
                                buttonStyle={{marginTop: 10}}
                                icon={{
                                    name: 'close',
                                    type: 'font-awesome',
                                    color: Colors.white
                                }}
                            />
                        </View>
                    </View>
                </Pressable>
            </Modal>

        </View>
    )
};

export default DatePickerComponent
