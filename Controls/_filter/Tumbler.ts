import {Control, TemplateFunction} from 'UI/Base';
import TumblerTemplate = require('wml!Controls/_filter/View/Tumbler');
import {RecordSet} from 'Types/collection';
import {ITumblerOptions} from 'Controls/toggle';
import {IFilterItem} from 'Controls/_filter/View/interface/IFilterView';
import {SyntheticEvent} from 'Vdom/Vdom';
import {isEqual} from 'Types/object';
import 'css!Controls/filter';

/**
 * Контрол фильтр-переключатель.
 *
 * @class Controls/_filter/Tumbler
 * @extends UI/Base:Control
 * @mixes Controls.toggle:Tumbler
 * @author Мельникова Е.А.
 * @public
 *
 * @demo Controls-demo/Filter_new/TumblerContainer/TumblerContainer
 */

interface IFilterTumblerOptions extends ITumblerOptions {
    source: IFilterItem[];
}

export default class FilterTumblerContainer extends Control<ITumblerOptions> {
    protected _template: TemplateFunction = TumblerTemplate;
    protected _tumblerSource: IFilterItem[] = null;
    protected _selectedKey: number|string = null;

    protected _beforeMount(options: IFilterTumblerOptions): void {
        this._setTumblerStates(options);
    }

    protected _beforeUpdate(newOptions: IFilterTumblerOptions): void {
        const sourceChanged = !isEqual(this._options.source, newOptions.source);
        if (sourceChanged) {
            this._setTumblerStates(newOptions);
        }
    }

    protected _handleSelectedKeyChanged(event: SyntheticEvent, value: number|string): void {
        this._notify('sourceChanged', [this._getUpdatedSource(value)]);
    }

    private _setTumblerStates(options: IFilterTumblerOptions): void {
        this._tumblerSource = this._getTumblerOptions(options.source);
        this._selectedKey = this._tumblerSource.value;
    }

    private _getTumblerOptions(items: RecordSet): IFilterItem[] {
        return items.find((item) => {
            return item.viewMode === 'tumbler';
        });
    }

    private _getUpdatedSource(value: number|string): IFilterItem[] {
        const tumblerOptions = this._getTumblerOptions(this._options.source);
        tumblerOptions.value = value;
        return {...this._options.source, ...tumblerOptions};
    }
}
