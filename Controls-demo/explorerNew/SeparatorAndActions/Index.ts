import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/SeparatorAndActions/SeparatorAndActions';
import * as CellTemplate from 'wml!Controls-demo/explorerNew/SeparatorAndActions/CellTemplate';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _header = Gadgets.getSearchHeader();
    protected _columns =  Gadgets.getSearchColumns().map((c, i) => i === 2 ? {...c, template: CellTemplate} : c);
    protected _searchValue: string = 'sata';

    protected _beforeMount(): void {
        this._columns[0].width = '400px';

        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getSmallSearchData(),
            filter: () => true
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
