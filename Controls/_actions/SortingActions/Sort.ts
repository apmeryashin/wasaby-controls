import rk = require('i18n!Controls');
import BaseAction, {IBaseActionOptions} from 'Controls/_actions/BaseAction';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {ILoadDataResult} from 'Controls/dataSource';

type TOrder = 'ASC' | 'DESC';

interface ISortingItem {
    id: string;
    title: string;
    value?: TOrder;
    icon?: string;
}

interface ISortAction extends IBaseActionOptions {
    items: [ISortingItem];
    prefetchResult: ILoadDataResult;
}

export default class Sort extends BaseAction {
    protected _items: RecordSet;
    protected _order: TOrder = 'DESC';
    protected _currentIcon: string = '';
    protected _value: [object];
    protected _selectedKey: string;

    constructor(options: ISortAction) {
        super(options);
        if (options.prefetchResult) { // ? предустановленный сортинг
            this._value = options.prefetchResult[0];
            this._selectedKey = Object.keys(this._value)[0];
        }
        this._setItems(options.items);
    }

    execute(options): void {
        const item = options.toolbarItem;

        if (item.get('parent') !== null) {
            this._selectedKey = item.getKey();
            this._setState(item);
            options.sourceController.setSorting([{
                [item.getKey()]: this._order
            }]);
        }
    }

    getChildren(root: string): Promise<RecordSet> {
        this._addField('parent', 'string', this._items, root);

        return Promise.resolve(this._items);
    }

    getValue() {
        return [this._selectedKey];
    }

    private _getIcon(): string {
        if (this._currentIcon) {
            return this._currentIcon + '_' + this._order;
        } else {
            if (this._order) {
                return 'Controls/sortIcons:arrow_' + this._order;
            }
        }
    }

    private _setItems(items: ISortingItem[]): void {
        if (items[0] && items[0].id === undefined) {
            items.forEach((item) => {
                item.id = item.paramName;
            });
        }

        this._items = new RecordSet({
            rawData: items,
            keyProperty: 'id'
        });
        this._addField('template', 'string', this._items, 'Controls/actions:SortingMenuItemTemplate');
        this._addField('value', 'string', this._items);

        if (this._value) {
            const paramName = Object.keys(this._value)[0];
            const value = this._value[paramName];
            const item = this._items.getRecordById(paramName);
            item.set('value', value);
            this._setState(item);
        }
    }

    private _setState(item: Model): void {
        this._order = item.get('value') || 'ASC';
        this._currentIcon = item.get('icon');
        this.icon = this._getIcon();
        this.tooltip = item.get('title');
    }

    private _addField(name: string, type: string, items: RecordSet, value?: unknown): void {
        if (items.getFormat().getFieldIndex(name) === -1) {
            items.addField({name, type}, undefined, value);
        }
    }

}

Object.assign(Sort.prototype, {
    id: 'sort',
    title: rk('Сортировка'),
    tooltip: rk('Сортировка'),
    icon: 'icon-TFDownload',
    iconStyle: 'secondary',
    'parent@': true
});
