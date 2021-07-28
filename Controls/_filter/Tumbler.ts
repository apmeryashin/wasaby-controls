import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import TumblerTemplate = require('wml!Controls/_filter/View/Tumbler');
import {RecordSet} from 'Types/collection';
import {ITumblerOptions} from 'Controls/toggle';
import 'css!Controls/filter';
import {SyntheticEvent} from 'Vdom/Vdom';
import {isEqual} from 'Types/object';

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
    source: RecordSet;
}

export default class FilterTumblerContainer extends Control<ITumblerOptions> {
    protected _template: TemplateFunction = TumblerTemplate;
    protected _tumblerOptions: ITumblerOptions = null;
    protected _selectedKey: number|string = null;

    protected _beforeMount(options: IFilterTumblerOptions): void {
        this._setTumblerStates(options);
    }

    protected _beforeUpdate(newOptions: IFilterTumblerOptions): void {
        if (!isEqual(this._options, newOptions)) {
            this._setTumblerStates(newOptions);
        }
    }

    protected _handleSelectedKeyChanged(event: SyntheticEvent, value: number|string): void {
        this._notify('sourceChanged', [this._getUpdatedSource(value)]);
    }

    private _setTumblerStates(options: IFilterTumblerOptions): void {
        const tumblerSource = this._getumblerOptions(options.source);
        this._tumblerOptions = tumblerSource.editorOptions;
        this._selectedKey = tumblerSource.value;
    }

    private _getumblerOptions(items: RecordSet): RecordSet {
        return items.find((item) => {
            return item.viewMode === 'tumbler';
        });
    }

    private _getUpdatedSource(value: number|string): void {
        const tumblerOptions = this._getumblerOptions(this._options.source);
        tumblerOptions.value = value;
        return {...this._options.source, ...tumblerOptions};
    }
}
