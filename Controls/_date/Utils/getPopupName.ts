const getPopupName = (datePopupType: string) => {
    switch (datePopupType) {
        case 'compactDatePicker':
            return 'Controls/compactDatePicker:View';
        case 'shortDatePicker':
            return 'Controls/shortDatePicker:View';
        default:
            return 'Controls/datePopup';
    }
};

export default getPopupName;
