import * as rk from 'i18n!Controls';
import ListAction from './ListAction';
import {IBaseActionOptions} from '../BaseAction';

export default class Remove extends ListAction {
    constructor(options: IBaseActionOptions) {
        super(options);
    }
}

Object.assign(Remove.prototype, {
    id: 'remove',
    title: rk('Удалить'),
    icon: 'icon-Erase',
    iconStyle: 'danger',
    commandName: 'Controls/listCommands:Remove',
    viewCommandName: 'Controls/viewCommands:PartialReload'
});
