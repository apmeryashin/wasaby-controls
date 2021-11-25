import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';

import DateRangeTemplate = require('wml!Controls/_propertyGrid/extendedEditors/DateRange');

interface IDateRangeEditorOptions extends IEditorOptions, IControlOptions {
    propertyValue: Date[];
}

/**
 * Редактор для поля ввода номера телефона.
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 * @author Аверкиев П.А.
 * @demo Controls-demo/PropertyGridNew/Editors/DateRangeEditor/Index
 * @public
 */
class DateRangeEditor extends Control<IDateRangeEditorOptions> implements IEditor {
    protected _template: TemplateFunction = DateRangeTemplate;
    protected _startDate: Date;
    protected _endDate: Date;

    protected _beforeMount(options: IDateRangeEditorOptions): void {
        const [startDate, endDate] = options.propertyValue;
        this._startDate = startDate;
        this._endDate = endDate;
    }

    protected _beforeUpdate(newOptions: IDateRangeEditorOptions): void {
        if (this._options.propertyValue !== newOptions.propertyValue) {
            const [startDate, endDate] = newOptions.propertyValue;
            this._startDate = startDate;
            this._endDate = endDate;
        }
    }

    protected _handleInputCompleted(event: SyntheticEvent, startDate: Date, endDate: Date): void {
        this._notify('propertyValueChanged', [[startDate, endDate]], {bubbling: true});
    }
}
export default DateRangeEditor;
