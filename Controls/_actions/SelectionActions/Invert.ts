import BaseAction from 'Controls/_actions/BaseAction';
import * as rk from 'i18n!Controls';
import {showType} from 'Controls/toolbars';

export default class InvertAction extends BaseAction {
    execute(options): void {
        options.operationsController.selectionTypeChanged('toggleAll');
    }
}

Object.assign(InvertAction.prototype, {
    icon: 'icon-Check2',
    iconStyle: 'secondary',
    title: rk('Инвертировать'),
    tooltip: rk('Инвертировать'),
    showType: showType.MENU
});
