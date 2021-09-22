const getPopupName = (datePopupType: string) => {
    if (datePopupType === 'compactDatePicker') {
        return 'Controls/compactDatePicker:View';
    }
    return 'Controls/datePopup';
};

export default getPopupName;
