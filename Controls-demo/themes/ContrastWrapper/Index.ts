import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import {RecordSet} from 'Types/collection';
import {IItemAction, TItemActionShowType} from 'Controls/itemActions';

import 'wml!Controls-demo/themes/ContrastWrapper/_cellEditor';
import { Editing } from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';

const columns: IColumn[] = [
    {
        displayProperty: 'title',
        width: '180px',
        template: 'wml!Controls-demo/themes/ContrastWrapper/_cellEditor'
    },
    {
        displayProperty: 'description',
        width: 'auto',
        template: 'wml!Controls-demo/themes/ContrastWrapper/_cellEditor'
    }
];

import * as Template from 'wml!Controls-demo/themes/ContrastWrapper/ContrastWrapper';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[];
    protected _columns: IColumn[] = columns;
    protected _items: RecordSet;
    protected _buttonStyles: string[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'unaccented', 'default', 'pale'];

    protected _beforeMount(): void {
        const data = Editing.getEditingData();
        this._viewSource = new Memory({
            keyProperty: 'key',
            data
        });
        this._itemActions = [{
            id: 1,
            icon: 'icon-Erase icon-error',
            title: 'delete',
            showType: TItemActionShowType.TOOLBAR
        }];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
