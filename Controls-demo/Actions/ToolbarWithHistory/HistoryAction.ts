import {BaseAction, IActionOptions} from 'Controls/actions';
import {IMenuControlOptions} from 'Controls/menu';
import {Memory} from 'Types/source';

export default class ActionMenuWithHistory extends BaseAction {
    protected _menuOptions: Partial<IMenuControlOptions> = null;
    constructor(options: IActionOptions) {
        super(options);
        this._menuOptions = {
            historyId: 'TEST_HISTORY_ID',
            source: options.source as Memory,
            keyProperty: 'id'
        };
        this.icon = 'icon-Print';
        this.title = 'Отчеты';
        this['parent@'] = true;
    }

    getMenuOptions(): Partial<IMenuControlOptions> {
        return this._menuOptions;
    }
}
