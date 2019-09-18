import { Alert } from 'react-native';

const defaultButton = {
    onPress: () => null,
    text: '',
    style: 'default',
};

export default {

    showAlert: (message, onClose = () => null) => {
        setTimeout(() => {
            Alert.alert(
                'App Nordeste',
                message,
                [{ onPress: onClose, text: 'Ok', style: 'default' }],
                { cancelable: true, onDismiss: onClose },
            );
        }, 200);
    },

    showConfirm: (message, cancelButton = defaultButton, confirmButton = defaultButton) => {
        setTimeout(() => {
            Alert.alert(
                'App Nordeste',
                message, [
                    {
                        onPress: cancelButton.onPress,
                        text: cancelButton.text,
                        style: cancelButton.style || 'cancel',
                    },
                    {
                        onPress: confirmButton.onPress,
                        text: confirmButton.text,
                        style: confirmButton.style || 'default',
                    },
                ], { cancelable: true, onDismiss: cancelButton.onPress },
            );
        }, 200);
    },

};
