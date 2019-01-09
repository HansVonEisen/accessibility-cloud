import { Bert } from 'meteor/themeteorchef:bert';


export const showNotification = ({ title, message }) => {
  Bert.alert({
    title,
    message,
    type: 'info',
    style: 'growl-top-right',
  });
};

export const showErrorNotification = ({ title = 'An Error occurred', error }) => {
  Bert.alert({
    title,
    message: error.message,
    type: 'danger',
    style: 'growl-top-right',
  });
};
