import {dropdownHistoryUtils} from 'Controls/dropdown';
import {default as HistorySourceMenu, getItems} from 'Controls-demo/dropdown_new/Button/HistoryId/historySourceMenu';
import {TKey} from 'Controls/interface';

let historySource;

function overrideOrigSourceMethod(root?: TKey, keyProperty?: string, nodeProperty: string = '@parent'): void {
    dropdownHistoryUtils.getSource = () => {
        if (!historySource) {
            historySource = new HistorySourceMenu({
                root,
                keyProperty,
                nodeProperty
            });
        }
        return Promise.resolve(historySource);
    };
}

function resetHistory() {
    historySource = undefined;
}

export {getItems, overrideOrigSourceMethod, resetHistory};
