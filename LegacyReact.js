const ReactNative = require('react-native');

const { Picker } = require('@react-native-picker/picker');

const { OS } = ReactNative.Platform;
if (OS === 'android') {
  const {
    RNDatePickerAndroid: DatePickerAndroid, 
    RNTimePickerAndroid: TimePickerAndroid,
} = ReactNative.NativeModules;

  Object.defineProperty(ReactNative, 'AndroidDialogPicker', {
    value: Picker,
    writable: false,
  });
  Object.defineProperty(ReactNative, 'DatePickerAndroid', {
      value: DatePickerAndroid,
      writable: false,
  });
  Object.defineProperty(ReactNative, 'TimePickerAndroid', {
    value: TimePickerAndroid,
    writable: false,
  });
}
