import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import DropdownTemplate = require('wml!Controls/_filterPanel/Editors/Dropdown');
import 'css!Controls/filterPanel';

interface IDropdownOptions extends IControlOptions {
    propertyValue: number[] | string[];
    displayProperty: string;
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
    protected _textValue: string = '';
    protected _selectedKeys: number[] | string [] = [];

    protected _beforeMount(options: IDropdownOptions): void {
        this._selectedKeys = options.propertyValue;
    }

    protected _beforeUpdate(newOptions: IDropdownOptions): void {
        if (this._options.propertyValue !== newOptions.propertyValue) {
            this._selectedKeys = newOptions.propertyValue;
        }
    }

    protected _handleSelectedKeysChanged(event: SyntheticEvent, value: number[] | string[]): void {
        this._notifySelectedKeysChanged(value);
    }

    protected _handleMenuItemActivate(event: SyntheticEvent, value: Model): void {
        this._notifySelectedKeysChanged([value.get(this._options.displayProperty)]);
    }

    private _handleTextValueChanged(event: SyntheticEvent, value: string): void {
        this._textValue = value;
    }

    private _notifySelectedKeysChanged(value: string[] | number[]): void {
        const extendedValue = {
            value,
            textValue: this._textValue,
            viewMode: 'basic'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }
}
export default DropdownEditor;
