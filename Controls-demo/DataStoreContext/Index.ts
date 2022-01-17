import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/DataStoreContext/Index';
import {DataLoader, ILoadDataResult} from 'Controls/dataSource';
import {Memory} from 'Types/source';
import {IFilterItem} from 'Controls/filter';

const listData = [
    {
        id: 0,
        title: 'Александр'
    },
    {
        id: 1,
        title: 'Алексей'
    },
    {
        id: 2,
        title: 'Дмитрий'
    },
    {
        id: 3,
        title: 'Андрей'
    }
];

interface IReceivedState {
    loadResults: ILoadDataResult;
}

export default class WidgetWrapper extends Control<IControlOptions, IReceivedState> {
    protected _template: TemplateFunction = template;
    protected _loadResult: ILoadDataResult = null;

    protected _beforeMount(): void | Promise<void> {
        const listSource = new Memory({
            data: listData,
            keyProperty: 'id'
        });
        const filterSource = [
            {
                name: 'title',
                value: undefined,
                viewMode: 'basic',
                textValue: ''
            }
        ] as IFilterItem[];
        const dataLoader = new DataLoader();

        return (dataLoader.load([{
            source: listSource,
            filterButtonSource: filterSource,
            keyProperty: 'id',
            filter: {}
        }]) as Promise<ILoadDataResult[]>).then(([loadResults]) => {
            this._loadResult = loadResults;
        });
    }
}
