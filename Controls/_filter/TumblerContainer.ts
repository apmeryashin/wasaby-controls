import {Control, TemplateFunction} from 'UI/Base';
import ThumblerContainerTemplate = require('wml!Controls/_filter/View/TumblerContainer');
import {default as Store} from 'Controls/Store';
import {ISourceOptions} from 'Controls/interface';
import {IFilterItem} from 'Controls/_filter/View/interface/IFilterView';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/filter';

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
    protected _source: IFilterItem[] = null;
    protected _sourceChangedCallbackId: string = null;

    protected _beforeMount(options: IFilterTumblerOptions): void {
        this._initTumblerStates(options);
    }

    protected _afterMount(options: IFilterTumblerOptions): void {
        if (options.useStore) {
            this._sourceChangedCallbackId = Store.onPropertyChanged('source', (source) => {
                this._source = source;
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

    protected _handleSourceChanged(event: SyntheticEvent, newSource: IFilterItem[]): void {
        if (this._options.useStore) {
            Store.dispatch('source', newSource);
        } else {
            this._notify('filterItemsChanged', [newSource], {bubbling: true});
        }
    }

    private _initTumblerStates(options: IFilterTumblerOptions): void {
        if (options.useStore) {
            this._source = Store.getState().source;
        } else {
            this._source = options.source;
        }
    }
}
