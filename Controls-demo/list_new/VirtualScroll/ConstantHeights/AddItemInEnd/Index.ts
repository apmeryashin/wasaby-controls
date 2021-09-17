import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/ConstantHeights/AddItemInEnd/AddItemInEnd';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {generateData} from '../../../DemoHelpers/DataCatalog';

interface IItem {
    title: string;
    key: number;
    keyProperty: string;
    count: number;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _itemsCount: number = 1000;
    private _itemsReadyCallback: Function;
    private _items = null;
    private _scrollToLastItem: boolean = true;

    protected _itemsReadyCallbackFn(items): void {
        this._items = items;
    }

    private get _page(): number {
        // tslint:disable-next-line
        return Math.ceil(this._itemsCount / 100 );
    }

    private dataArray: IItem[] = generateData({
        keyProperty: 'key',
        count: 1000,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.key}.`;
        }
    });

    private _addItem(): void {
        this._viewSource.update(new RecordSet({
            rawData: [{
                key: ++this._itemsCount,
                title: `Запись с ключом ${this._itemsCount}.`
            }]
        }));

        this._children.list.reload(true, {
            page: 3,
            pageSize: 300
        }).then(() => {
            this._scrollToLastItem = true;
        });
    }

    protected _beforeMount(): void {
        this._itemsReadyCallback = this._itemsReadyCallbackFn.bind(this);
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this.dataArray
        });
    }

    private _drawItems() {
        if (this._scrollToLastItem) {
            this._children.list.scrollToItem(this._items.at(this._items.getCount() - 1).getKey());
            this._scrollToLastItem = false;
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
