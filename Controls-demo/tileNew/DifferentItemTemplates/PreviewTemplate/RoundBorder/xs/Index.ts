import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';

import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/PreviewTemplate/RoundBorder/xs/xs';

import {Gadgets} from '../../../../DataHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];
    protected _roundBorder = {tl: 'xs', tr: 'xs', br: 'xs', bl: 'xs'};

    protected _itemActions: any[] = Gadgets.getPreviewActions();

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getPreviewItems()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
