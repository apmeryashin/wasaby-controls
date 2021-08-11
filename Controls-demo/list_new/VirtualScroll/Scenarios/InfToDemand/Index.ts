import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/Scenarios/InfToDemand/Template';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';

interface IItem {
    title: string;
    key: number;
    keyProperty: string;
    count: number;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _view: string = 'infinity';
    protected _pageSize: number = 100;

    private dataArray: IItem[] = generateData({
        keyProperty: 'key',
        count: 100,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.key}.`;
        }
    });

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this.dataArray
        });
    }

    protected _toggleNavigation(): void {
        this._view = this._view === 'infinity' ? 'demand' : 'infinity';
        this._pageSize = this._view === 'infinity' ? 100 : 10;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
