import { Control, TemplateFunction } from 'UI/Base';
import { Memory } from 'Types/source';
import { SyntheticEvent } from 'Vdom/Vdom';
import { Model } from 'Types/entity';
import { IItemAction } from 'Controls/itemActions';

import {getActionsWithViewMode as getItemActions} from 'Controls-demo/list_new/DemoHelpers/ItemActionsCatalog';

import * as Template from 'wml!Controls-demo/list_new/ItemActions/viewMode/viewMode';

const data = [
    {
        key: 'record_0',
        title: 'Различные режимы отображения операций над записью размер s',
        itemActions: getItemActions().map((action) => ({...action, iconSize: 's'}))
    },
    {
        key: 'record_1',
        title: 'Различные режимы отображения операций над записью размер m',
        itemActions: getItemActions().map((action) => ({...action, iconSize: 'm'}))
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _clickedAction: string;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data
        });
    }

    _onActionClick(event: SyntheticEvent, action: IItemAction, item: Model): void {
        this._clickedAction = action.title;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
