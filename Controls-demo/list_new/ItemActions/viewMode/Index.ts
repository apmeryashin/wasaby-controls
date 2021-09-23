import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import { IItemAction } from 'Controls/itemActions';

import {getActionsWithViewMode as getItemActions} from 'Controls-demo/list_new/DemoHelpers/ItemActionsCatalog';

import * as Template from 'wml!Controls-demo/list_new/ItemActions/viewMode/viewMode';

const data = [
    {
        key: 'record_0',
        title: 'Различные режимы отображения и размеры операций над записью'
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[];

    protected _beforeMount(): void {
        this._itemActions = getItemActions();
        this._viewSource = new Memory({
            keyProperty: 'key',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
