import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';

import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/MediumTemplate/RoundBorder/s/s';

import {Gadgets} from '../../../../DataHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];
    protected _roundBorder = {tl: 's', tr: 's', br: 's', bl: 's'};

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            parentProperty: 'parent',
            data: Gadgets.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
