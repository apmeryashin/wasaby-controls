import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanelPopup/Stack';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/filterPanelPopup';
import {View} from 'Controls/filterPanel';
import {IFilterItem} from 'Controls/_filter/View/interface/IFilterItem';
import {isEqual} from 'Types/object';

interface IStackPopup extends IControlOptions {
    items: IFilterItem[];
}

/**
 * Шаблон стекового окна для панели фильтра.
 * @class Controls/_filterPanelPopup/Stack
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 *
 * @public
 */

/**
 * @name Controls/_filterPanelPopup/Stack#bodyContentTemplate
 * @cfg {TemplateFunction|String} Шаблон окна панели фильтров.
 */

export default class Stack extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _items: IFilterItem[];
    protected _children: {
        filterPanel: View
    };

    protected _beforeMount(options: IStackPopup): void {
        this._items = options.items;
    }

    protected _collapsedGroupsChanged(event: SyntheticEvent, collapsedFilters: string[] | number[]): void {
        this._notify('sendResult', [{action: 'collapsedFiltersChanged', collapsedFilters}], {bubbling: true});
    }

    protected _sourceChangedHandler(event: SyntheticEvent, items: IFilterItem[]): void {
        this._items = items;
    }

    protected _filterAppliedHandler(event: SyntheticEvent): void {
        this._notify('close', [], {bubbling: true});
    }

    protected _applyFilter(event: SyntheticEvent): void {
        this._notify('sendResult', [{items: this._items}], {bubbling: true});
        this._notify('close', [], {bubbling: true});
    }

    protected _resetFilter(event: SyntheticEvent): void {
        this._children.filterPanel.resetFilter();
    }

    protected _isFilterReseted(items: IFilterItem[]): boolean {
        return !items.some((item) => {
            return !isEqual(item.value, item.resetValue);
        });
    }
}
