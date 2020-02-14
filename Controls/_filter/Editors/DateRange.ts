import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import DateRangeTemplate = require('wml!Controls/_filter/Editors/DateRange');
import tmplNotify = require('Controls/Utils/tmplNotify');

/**
 * Контрол используют в качестве редактора для выбора периода дат на {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/base-settings/#step-3 панели фильтров}.
 * @remark
 * Подробнее о настройке объединенного фильтра с выбором периода читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/period-selection/ здесь}.
 * @class Controls/_filter/Editors/DateRange
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @extends Core/Control
 * @author Герасимов А.М.
 * @see Controls/filter:View
 * @public
 */
class DateRangeEditor extends Control<IControlOptions> {
    protected _template: TemplateFunction = DateRangeTemplate;
    protected _tmplNotify: Function = tmplNotify;
    protected _templateName: string;

    protected _beforeMount(options: IControlOptions): void {
        this._templateName = 'Controls/dateRange:' + (options.editorMode === 'Selector' ? 'Selector' : 'LiteSelector');
    }

    private _rangeChanged(event: SyntheticEvent<'rangeChanged'>, startValue: Date, endValue: Date): Promise<void> {
        return import('Controls/dateRange').then((dateRange) => {
            const caption = dateRange.Utils.formatDateRangeCaption.call(null, startValue, endValue, this._options.emptyCaption);
            this._notify('textValueChanged', [caption]);
            this._notify('rangeChanged', [startValue, endValue]);
        });
    }

    static getDefaultOptions() {
        return {
            editorMode: 'Lite'
        };
    }
}
/**
 * @event Происходит при изменении выбранного значения.
 * @name Controls/_filter/Editors/DateRange#textValueChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} caption Строковое представление периода дат.
 */

/**
 * @name Controls/_filter/Editors/DateRange#editorMode
 * @cfg {String} Режим отображения редактора.
 * @variant Selector В качестве редактора используется {@link Controls/dateRange:Selector}.
 * @variant Lite В качестве редактора используется {@link Controls/dateRange:LiteSelector}.
 * @default Lite
 */
export default DateRangeEditor;
