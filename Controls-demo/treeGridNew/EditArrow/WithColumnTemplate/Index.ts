import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { Model } from 'Types/entity';

import { IColumn } from 'Controls/grid';

import * as Template from 'wml!Controls-demo/treeGridNew/EditArrow/WithColumnTemplate/WithColumnTemplate';
import * as TreeMemory from 'Controls-demo/List/Tree/TreeMemory';
import * as memorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import { TreeData, TreeColumnsWithTemplate, TreeHeader } from 'Controls-demo/treeGridNew/EditArrow/resources/resources';

export default class WithColumnTemplate extends Control<IControlOptions> {
    _template: TemplateFunction = Template;
    _source: typeof TreeMemory;
    _columns: IColumn[];
    _header: IHeader;

    __beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._source = new TreeMemory({
            keyProperty: 'key',
            parentProperty: 'parent',
            filter: memorySourceFilter(),
            data: TreeData
        });
        this._columns = TreeColumnsWithTemplate;
        this._header = TreeHeader;
    }

    _editArrowVisibilityCallback(item: Model): boolean {
        if (item.get('parent@')) {
            return true;
        }
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/treeGridNew/EditArrow/resources/EditArrow'
    ];
}
