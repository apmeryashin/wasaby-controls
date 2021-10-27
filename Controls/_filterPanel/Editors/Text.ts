import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as TextTemplate from 'wml!Controls/_filterPanel/Editors/Text';
import 'css!Controls/filterPanel';

export interface ITextEditorOptions extends IControlOptions {
    filterValue: unknown;
}

/**
 * Контрол используют в качестве редактора для выбора логического параметра на {@link Controls/filterPanel:View панели фильтров}.
 * @class Controls/_filterPanel/Editors/Text
 * @extends Core/Control
 * @author Мельникова Е.А.
 * @demo Controls-demo/filterPanel/FilterEditors/TextEditor/Index
 * @public
 */

/**
 * @name Controls/_filterPanel/Editors/Text#filterValue
 * @cfg {boolean} Значение, которое передастся в панель фильтров при выборе.
 */

class TextEditor extends Control<ITextEditorOptions> {
    protected _template: TemplateFunction = TextTemplate;

    protected _extendedCaptionClickHandler(): void {
        this._notify('propertyValueChanged', [this._options.filterValue], {bubbling: true});
    }
}

export default TextEditor;
