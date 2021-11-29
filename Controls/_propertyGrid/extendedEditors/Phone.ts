import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';

import PhoneTemplate = require('wml!Controls/_propertyGrid/extendedEditors/Phone');

interface IPhoneEditorOptions extends IEditorOptions, IControlOptions {
    propertyValue: string;
}
/**
 * Редактор для поля ввода номера телефона.
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 * @author Аверкиев П.А.
 * @demo Controls-demo/PropertyGridNew/Editors/PhoneEditor/Index
 * @public
 */
class PhoneEditor extends Control<IPhoneEditorOptions> implements IEditor {
    protected _template: TemplateFunction = PhoneTemplate;
    protected _value: string = '';

    protected _beforeMount(options: IPhoneEditorOptions): void {
        this._value = options.propertyValue;
    }

    protected _beforeUpdate(newOptions: IPhoneEditorOptions): void {
        if (this._options.propertyValue !== newOptions.propertyValue) {
            this._value = newOptions.propertyValue;
        }
    }

    protected _handleInputCompleted(event: SyntheticEvent, value: string): void {
        this._notify('propertyValueChanged', [value], {bubbling: true});
    }
}
export default PhoneEditor;
