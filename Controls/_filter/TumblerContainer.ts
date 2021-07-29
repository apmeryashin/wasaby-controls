import {Control, TemplateFunction} from 'UI/Base';
import ThumblerContainerTemplate = require('wml!Controls/_filter/View/TumblerContainer');
import {default as Store} from 'Controls/Store';
import {ISourceOptions} from 'Controls/interface';
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

interface IFilterTumblerOptions extends ISourceOptions {
    useStore?: boolean;
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
            this._sourceChangedCallbackId = Store.onPropertyChanged('source', (source) => {
                this._setTumblerStates(source);
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
            Store.dispatch('source', newSource);
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
            filterSource = Store.getState().source;
        } else {
            filterSource = options.source;
        }
        this._setTumblerStates(filterSource);

    }

    private _setTumblerStates(source: IFilterItem[]): void {
        const tumblerOptions = this._getTumblerOptions(source);
        this._items = tumblerOptions.editorOptions.items;
        this._selectedKey = tumblerOptions.value;
    }

    private _getUpdatedSource(value: number|string): IFilterItem[] {
        const tumblerOptions = this._getTumblerOptions(this._options.source);
        tumblerOptions.value = value;
        return {...this._options.source, ...tumblerOptions};
    }
}
