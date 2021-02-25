import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Header/Multiheader/AddButton/AddButton';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/grid/Header/Multiheader/AddButton/GridCaptionHeaderCell';
import { IColumn } from 'Controls/interface';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _header: IHeader[] = getCountriesStats().getMultiHeaderVar2();
    private _columns: IColumn[] = getCountriesStats().getColumnsWithWidths().slice(1);

    protected _beforeMount(): void {
        // tslint:disable-next-line
        this._header[0].template = 'wml!Controls-demo/grid/Header/Multiheader/AddButton/GridCaptionHeaderCell';
        this._columns[0].width = '350px';

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
