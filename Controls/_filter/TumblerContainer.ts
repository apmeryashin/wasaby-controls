import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ThumblerContainerTemplate = require('wml!Controls/_filter/View/TumblerContainer');
import {default as Store} from 'Controls/Store';
import {IFilterItem} from 'Controls/_filter/View/interface/IFilterView';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/filter';
import {RecordSet} from 'Types/collection';

/**
 * Контрол используют в качестве контейнера для {@link Controls.filter:Tumbler}.
 *
 * @class Controls/_filter/TumblerContainer
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 * @public
 *
 * @demo Controls-demo/Filter_new/TumblerContainer/TumblerContainer
 */

interface IFilterTumblerOptions extends IControlOptions {
    useStore?: boolean;
    filterButtonItems?: IFilterItem[];
    filterButtonSource?: IFilterItem[];
}

export default class FilterTumblerContainer extends Control<IFilterTumblerOptions> {
    protected _template: TemplateFunction = ThumblerContainerTemplate;
    protected _items: IFilterItem[] = null;
    protected _sourceChangedCallbackId: string = null;
    protected _selectedKey: number|string = null;

    protected _beforeMount(options: IFilterTumblerOptions): void {
        this._initTumblerStates(options);
    }

    protected _afterMount(options: IFilterTumblerOptions): void {
        if (options.useStore) {
            this._sourceChangedCallbackId = Store.onPropertyChanged('filterSource', (filterSource) => {
                this._setTumblerStates(filterSource);
            });
        }
    }

    protected _beforeUpdate(newOptions: IFilterTumblerOptions): void {
        this._initTumblerStates(newOptions);
    }

    protected _beforeUnmount(): void {
        if (this._sourceChangedCallbackId) {
            Store.unsubscribe(this._sourceChangedCallbackId);
        }
    }

    protected _handleSelectedKeyChanged(event: SyntheticEvent, value: number|string): void {
        const newSource = this._getUpdatedSource(value);
        if (this._options.useStore) {
            Store.dispatch('filterSource', newSource);
        } else {
            this._notify('filterItemsChanged', [newSource], {bubbling: true});
        }
    }

    private _getTumblerOptions(items: RecordSet): IFilterItem[] {
        return items.find((item) => {
            return item.viewMode === 'tumbler';
        });
    }

    private _initTumblerStates(options: IFilterTumblerOptions): void {
        let filterSource;
        if (options.useStore) {
            filterSource = Store.getState().filterSource;
        }
        if (!filterSource) {
            filterSource = options.filterButtonItems || options.filterButtonSource;
        }
        this._setTumblerStates(filterSource);

    }

    private _setTumblerStates(source: IFilterItem[]): void {
        const tumblerOptions = this._getTumblerOptions(source);
        this._items = tumblerOptions.editorOptions.items;
        this._selectedKey = tumblerOptions.value;
    }

    private _getUpdatedSource(value: number|string): IFilterItem[] {
        const filterSource = this._options.filterButtonItems || this._options.filterButtonSource;
        const tumblerOptions = this._getTumblerOptions(filterSource);
        return filterSource.map((item) => {
            if (item.name === tumblerOptions.name) {
                item.value = value;
            }
            return item;
        });
    }
}
