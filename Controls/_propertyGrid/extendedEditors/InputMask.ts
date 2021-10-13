import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import InputMaskTemplate = require('wml!Controls/_propertyGrid/extendedEditors/InputMask');
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';

interface IInputMaskEditorOptions extends IEditorOptions, IControlOptions {
    propertyValue: string;
}
/**
 * Редактор для поля ввода значения с заданным форматом.
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 * @author Мельникова Е.А.
 * @demo Controls-demo/PropertyGridNew/Editors/InputMask/Index
 * @public
 */
class InputMaskEditor extends Control<IInputMaskEditorOptions> implements IEditor {
    protected _template: TemplateFunction = InputMaskTemplate;
    protected _value: string = '';

    protected _beforeMount(options: IInputMaskEditorOptions): void {
        this._value = options.propertyValue;
    }

    protected _beforeUpdate(newOptions: IInputMaskEditorOptions): void {
        if (this._options.propertyValue !== newOptions.propertyValue) {
            this._value = newOptions.propertyValue;
        }
    }

    protected _handleInputCompleted(event: SyntheticEvent, value: string): void {
        this._notify('propertyValueChanged', [value], {bubbling: true});
    }
}
export default InputMaskEditor;
