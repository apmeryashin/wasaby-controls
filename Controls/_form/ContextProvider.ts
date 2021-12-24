import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_form/ContextProvider/ContextProvider');
import {default as WorkByKeyboardContext} from '../Context/WorkByKeyboardContext';

/**
 * Контрол-обертка для связи управления с клавиатуры и подсветки контролов, на который приходит фокус.
 * @extends UI/Base:Control
 * @public
 * @author Красильников А.С.
 */

export default class ContextProvider extends Control<IControlOptions> {
    _template: TemplateFunction = template;
    protected _workByKeyboard: WorkByKeyboardContext;

    private _beforeMount(): void {
        this._workByKeyboard = new WorkByKeyboardContext();
    }

    _getChildContext(): object {
        return {
            workByKeyboard: this._workByKeyboard
        };
    }
}
