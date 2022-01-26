import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanelPopup/sticky/Sticky';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as rk from 'i18n!Controls';
import {IFilterItem, updateFilterDescription, getFilterByFilterDescription} from 'Controls/filter';
import {View} from 'Controls/filterPanel';
import {isEqual} from 'Types/object';
import 'css!Controls/filterPanelPopup';
import 'css!Controls/filterPanel';

interface IStickyPopup extends IControlOptions {
    items: IFilterItem[];
    historyId?: string;
    orientation: string;
    width: string;
}

/**
 * Шаблон стики окна для панели фильтра.
 * @class Controls/_filterPanelPopup/Sticky
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 *
 * @public
 */

/**
 * @name Controls/_filterPanelPopup/Sticky#applyButtonCaption
 * @cfg {String} Текст для кнопки применения в шапке окна.
 */

/**
 * @name Controls/_filterPanelPopup/Sticky#orientation
 * @cfg {String} Ориентация панели фильтров.
 * @variant vertical Вертикальная ориентация панели. Блок истории отображается внизу.
 * @variant horizontal Горизонтальная ориентация панели. Блок истории отображается справа.
 * @default vertical
 */

/**
 * @name Controls/_filterPanelPopup/Sticky#width
 * @cfg {String} Размер панели фильтров. Поддерживается стандартная линейка размеров диалоговых окон.
 * @demo Controls-demo/filterPanelPopup/Width/Index
 */

/**
 * @name Controls/_filterPanelPopup/Sticky#headingCaption
 * @cfg {String} Текст шапки окна панели фильтров.
 */

export default class Sticky extends Control<IStickyPopup> {
    protected _template: TemplateFunction = template;
    protected _headingCaption: string;
    protected _resetButtonVisible: boolean;
    protected _items: IFilterItem[];
    protected _hasBasicItems: boolean;
    protected _children: {
        filterPanel: View
    };

    protected _beforeMount(options: IStickyPopup): void {
        this._items = options.items;
        this._setFilterParams(options.items);
    }

    protected _beforeUpdate(newOptions: IStickyPopup): void {
        if (!isEqual(this._options.items, newOptions.items)) {
            this._callCallbacksAndSetFilterItems(newOptions.items);
        }
    }

    protected _sourceChangedHandler(event: SyntheticEvent, items: IFilterItem[]): void {
        this._callCallbacksAndSetFilterItems(items);
    }

    protected _setFilterParams(items: IFilterItem[]): void {
        this._hasBasicItems = this._getHasBasicItems();
        this._headingCaption = this._getHeadingCaption(this._hasBasicItems);
        this._resetButtonVisible = !this._isFilterReseted(items);
    }

    protected _callCallbacksAndSetFilterItems(items: IFilterItem[]): void {
        const currentFilter = getFilterByFilterDescription({}, this._items);
        const updatedFilter = getFilterByFilterDescription({}, items);
        updateFilterDescription(items, currentFilter, updatedFilter, this._updateFilterParams.bind(this));
    }

    protected _getHeadingCaption(hasBasicItems: boolean): string {
        return hasBasicItems ? rk('Отбираются') : rk('Можно отобрать');
    }

    protected _isFilterReseted(items: IFilterItem[]): boolean {
        return !items.some((item) => {
            return !isEqual(item.value, item.resetValue);
        });
    }

    protected _collapsedGroupsChanged(event: SyntheticEvent, collapsedFilters: string[] | number[]): void {
        this._notify('sendResult', [{action: 'collapsedFiltersChanged', collapsedFilters}], {bubbling: true});

    }

    protected _applyFilter(event: SyntheticEvent): void {
        this._notify('sendResult', [{items: this._items}], {bubbling: true});
        this._notify('close', [], {bubbling: true});
    }

    protected _resetFilter(event: SyntheticEvent): void {
        this._children.filterPanel.resetFilter();
    }

    protected _getHasBasicItems(): boolean {
        return !!this._getBasicFilterItems().length;
    }

    protected _getBasicFilterItems(): IFilterItem[] {
        return this._getItemsByViewMode('basic');
    }

    private _getItemsByViewMode(viewMode: IFilterItem['viewMode']): IFilterItem[] {
        return this._items.filter((item) => {
            return item.viewMode === viewMode || (viewMode === 'basic' && !item.viewMode);
        });
    }

    private _updateFilterParams(newItems: IFilterItem[]): void {
        this._items = newItems;
        this._setFilterParams(newItems);
    }
}

Object.defineProperty(Sticky, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): Partial<IStickyPopup> {
        return {
            orientation: 'vertical',
            width: 'default'
        };
    }
});
