import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Popup/SlidingPanel/HeaderContentTemplate/PopupTemplate/PopupTemplate');
import {RecordSet} from 'Types/collection';

class PopupTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _toolbarItems: RecordSet = new RecordSet({
        rawData: [
            {id: 'delete', title: 'Удалить',  icon: 'icon-Erase', showType: 0, viewMode: 'toolButton'},
            {id: 'rubles', title: 'Оплатить',  icon: 'icon-Ruble', showType: 0, viewMode: 'toolButton'},
            {id: 'expand', title: 'История',  icon: 'icon-ExpandList', showType: 0, viewMode: 'toolButton'},
            {id: 'apply', title: 'Подтвердить', icon: 'icon-Yes', showType: 0, iconStyle: 'success', viewMode: 'functionalButton'}
        ]
    });
    static _styles: string[] = [
        'Controls-demo/Controls-demo'
    ];
}
export default PopupTemplate;
