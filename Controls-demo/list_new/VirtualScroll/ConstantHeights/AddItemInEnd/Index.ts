import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/ConstantHeights/AddItemInEnd/AddItemInEnd';
import {Memory} from 'Types/source';
import {RecordSet } from 'Types/collection';
import {Container} from 'Controls/scroll';
import {generateData} from '../../../DemoHelpers/DataCatalog';
import {Model} from 'Types/entity';

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
    private _scrollToBottom: boolean = false;
    private _items: RecordSet;
    private _itemsReady: Function;
    protected _children: {
        scroll: Container;
    };
    protected _initialScrollPosition = {
        vertical: 'end'
    };

    private dataArray: IItem[] = generateData({
        keyProperty: 'key',
        count: 1000,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.key}.`;
        }
    });

    protected _addItem(): void {
        this._items.add(new Model({
            rawData: {
                key: ++this._itemsCount,
                title: `Запись с ключом ${this._itemsCount}.`
            }
        }));
        this._scrollToBottom = true;
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this.dataArray
        });
        this._itemsReady = this._saveItems.bind(this);
    }

    private _saveItems(items: RecordSet): void {
        this._items = items;
    }

    private _onDrawItems(): void {
        if (this._scrollToBottom) {
            this._children.scroll.scrollToBottom();
            this._scrollToBottom = false;
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
