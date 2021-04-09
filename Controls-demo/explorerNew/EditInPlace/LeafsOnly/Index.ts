import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/EditInPlace/LeafsOnly/LeafsOnly';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';
import * as CellTemplate from 'wml!Controls-demo/explorerNew/EditInPlace/LeafsOnly/CellTemplate';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: MemorySource;
    private _columns: IColumn[] = Gadgets.getColumns();

    protected _beforeMount(): void {
        this._columns[0].template = CellTemplate;
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
