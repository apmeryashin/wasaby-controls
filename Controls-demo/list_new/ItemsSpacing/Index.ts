import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {TOffsetSize} from 'Controls/interface';
import {Control, TemplateFunction} from 'UI/Base';
import {generateData} from '../DemoHelpers/DataCatalog';
import * as template from 'wml!Controls-demo/list_new/ItemsSpacing/Index';
import 'css!Controls-demo/Controls-demo';

export default class Index extends Control {
    protected _template: TemplateFunction = template;

    protected _viewSource: Memory;

    protected _itemsSpacing: TOffsetSize = 'm';

    protected _itemsSpacingSource: RecordSet = new RecordSet({
        rawData: [
            {id: '3xs'},
            {id: '2xs'},
            {id: 'xs'},
            {id: 's'},
            {id: 'st'},
            {id: 'm'},
            {id: 'l'},
            {id: 'xl'},
            {id: '2xl'},
            {id: '3xl'}
        ],
        keyProperty: 'id'
    });

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: generateData({
                keyProperty: 'key',
                count: 300,
                beforeCreateItemCallback: (item: {key: number; title: string}) => {
                    item.title = `Запись с ключом ${item.key}.`;
                }
            })
        });
    }
}
