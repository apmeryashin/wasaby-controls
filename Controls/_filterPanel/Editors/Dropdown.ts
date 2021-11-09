import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import DropdownTemplate = require('wml!Controls/_filterPanel/Editors/Dropdown');
import 'css!Controls/filterPanel';

interface IDropdownOptions extends IControlOptions {
    propertyValue: number[] | string[];
}

interface IDropdown {
    readonly '[Controls/_filterPanel/Editors/Dropdown]': boolean;
}

/**
 * Контрол используют в качестве редактора для выбора значения из выпадающего списка.
 * @class Controls/_filterPanel/Editors/Dropdown
 * @extends UI/Base:Control
 * @mixes Controls/filterPopup:Dropdown
 * @author Мельникова Е.А.
 * @public
 */

class DropdownEditor extends Control<IDropdownOptions> implements IDropdown {
    readonly '[Controls/_filterPanel/Editors/Dropdown]': boolean = true;
    protected _template: TemplateFunction = DropdownTemplate;

    protected _handleSelectedKeysChanged(event: SyntheticEvent, value: number[] | string[]): void {
        const extendedValue = {
            value
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _extendedCaptionClickHandler(): void {
        this._notify('propertyValueChanged', [this._options.value], {bubbling: true});
    }
}
export default DropdownEditor;
