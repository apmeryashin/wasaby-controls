import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Results/FromMeta/CustomResultsCells/CustomResultsCells';
import * as sqResTpl from 'wml!Controls-demo/gridNew/Results/FromMeta/CustomResultsCells/resultCell';
import * as defResTpl from 'wml!Controls-demo/gridNew/Results/FromMeta/CustomResultsCells/resultCellDefault';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/interface';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeader[] = getCountriesStats().getDefaultHeader();
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths().map((c, i) => ({
        ...c,
        result: undefined,
        // tslint:disable-next-line
        resultTemplate: (i === 4 ? sqResTpl : (i === 5 ? defResTpl : undefined))
    }));
    private _fullResultsIndex: number = 0;
    private _partialResultsIndex: number = 0;

    constructor() {
        super({});
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    private _dataLoadCallback(items: RecordSet): void {
        items.setMetaData({
            ...items.getMetaData(),
            results: this._generateResults(items)
        });
    }

    private _updateMeta(): void {
        this._children.grid.reload();
    }

    private _setMeta(): void {
        const items = this._children.grid.getItems();
        items.setMetaData({
            ...items.getMetaData(),
            results: this._generateResults(items)
        });
    }

    private _setResultRow(): void {
        const items = this._children.grid.getItems();
        const results = items.getMetaData().results;
        results.set('square', getCountriesStats().getResults().partial[this._partialResultsIndex]);
        this._partialResultsIndex = ++this._partialResultsIndex % getCountriesStats().getResults().partial.length;
    }

    private _generateResults(items: RecordSet): Model {
        const results = new Model({

            // Устанавливаем адаптер для работы с данными, он будет соответствовать адаптеру RecordSet'а.
            adapter: items.getAdapter(),

            // Устанавливаем тип полей строки итогов.
            format: [
                { name: 'population', type: 'real' },
                { name: 'square', type: 'real' },
                { name: 'populationDensity', type: 'real'}
            ]
        });

        const data = getCountriesStats().getResults().full[this._fullResultsIndex];

        results.set('population', data.population);
        results.set('square', data.square);
        results.set('populationDensity', data.populationDensity);

        this._fullResultsIndex = ++this._fullResultsIndex % getCountriesStats().getResults().full.length;
        return results;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
