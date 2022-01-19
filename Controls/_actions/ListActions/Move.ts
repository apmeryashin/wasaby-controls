import * as rk from 'i18n!Controls';
import ListAction from './ListAction';
import {IBaseActionOptions} from '../BaseAction';

export default class Move extends ListAction {
    constructor(options: IBaseActionOptions) {
        super(options);
    }
}

Object.assign(Move.prototype, {
    id: 'move',
    title: rk('Переместить'),
    icon: 'icon-Move',
    iconStyle: 'secondary',
    commandName: 'Controls/listCommands:Move',
    viewCommandName: 'Controls/viewCommands:PartialReload'
});
