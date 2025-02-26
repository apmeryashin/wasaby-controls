import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';
import {IItemAction} from 'Controls/itemActions';

import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/RichTemplate/RoundBorder/s/s';

import {DATA, ITEM_ACTIONS} from 'Controls-demo/tileNew/DataHelpers/RichTemplate';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];
    protected _itemActions: IItemAction[];
    protected _roundBorder = {tl: 's', tr: 's', br: 's', bl: 's'};

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: DATA
        });
        this._itemActions = ITEM_ACTIONS;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
