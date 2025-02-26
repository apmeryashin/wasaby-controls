import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';

import {Data} from 'Controls-demo/gridNew/Results/FontColorStyle/Data';

import * as Template from 'wml!Controls-demo/gridNew/Results/FontColorStyle/FontColorStyle';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = Data.getHeader();
    protected _columns: IColumn[] = Data.getColumns();

    constructor() {
        super({});
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Data.getData()
        });
    }

    private _dataLoadCallback(items: RecordSet): void {
        const results = new Model({
            // Устанавливаем адаптер для работы с данными, он будет соответствовать адаптеру RecordSet'а.
            adapter: items.getAdapter(),

            // Устанавливаем тип полей строки итогов.
            format: [
                { name: 'success', type: 'real' },
                { name: 'link', type: 'real' },
                { name: 'primary', type: 'real' },
                { name: 'secondary', type: 'real' },
                { name: 'readonly', type: 'real' },
                { name: 'unaccented', type: 'real' },
                { name: 'warning', type: 'real' },
                { name: 'danger', type: 'real' }
            ],

            // Устанавливаем значения полей
            rawData: {
                success: '30.6',
                link: '30.1',
                primary: '30.6',
                secondary: '30.5',
                readonly: '30',
                unaccented: '30.1',
                warning: '300000',
                danger: '3000000'
            }
        });

        items.setMetaData({
            ...items.getMetaData(),
            results
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
