import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import LookupTemplate = require('wml!Controls/_filterPanel/Editors/Lookup');
import {Selector, showSelector} from 'Controls/lookup';
import * as rk from 'i18n!Controls';
import {Model} from 'Types/entity';
import {List} from 'Types/collection';
import {isEqual} from 'Types/object';
import 'css!Controls/filterPanel';

interface ILookupOptions extends IControlOptions {
    propertyValue: number[] | string[] | number | string;
    keyProperty: string;
    multiSelect?: boolean;
}

interface ILookup {
    readonly '[Controls/_filterPanel/Editors/Lookup]': boolean;
}

/**
 * Контрол используют в качестве редактора для выбора значения из справочника.
 * @class Controls/_filterPanel/Editors/Lookup
 * @extends UI/Base:Control
 * @mixes Controls/filterPopup:Lookup
 * @author Мельникова Е.А.
 * @public
 */

class LookupEditor extends Control<ILookupOptions> implements ILookup {
    readonly '[Controls/_filterPanel/Editors/Lookup]': boolean = true;
    protected _template: TemplateFunction = LookupTemplate;
    protected _textValue: string = rk('Еще');
    protected _selectedKeys: string[] | number[] = [];
    protected _children: {
        lookupEditor: Selector
    };

    protected _beforeMount(options: ILookupOptions): void {
        this._selectedKeys = this._getSelectedKeys(options.propertyValue, options.multiSelect);
    }

    protected _beforeUpdate(options: ILookupOptions): void {
        if (!isEqual(this._options.propertyValue, options.propertyValue)) {
            this._selectedKeys = this._getSelectedKeys(options.propertyValue, options.multiSelect);
        }
    }

    protected _getSelectedKeys(propertyValue: number[] | string[] | number | string, multiSelect: boolean):
                               number[] | string[] {
        return multiSelect ? propertyValue : [propertyValue];
    }

    protected _handleCloseEditorClick(event: SyntheticEvent): void {
        const extendedValue = {
            value: this._options.propertyValue,
            textValue: '',
            viewMode: 'extended'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _handleSelectedKeysChanged(event: SyntheticEvent, value: number[] | string[]): void {
        this._selectedKeys = this._getSelectedKeys(value, this._options.multiSelect);
        const extendedValue = {
            value,
            textValue: this._textValue
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _extendedCaptionClickHandler(event: SyntheticEvent): void {
        const popupOptions = {
            eventHandlers: {
                onResult: (result: List<Model>) => {
                    let selectedValue;
                    if (this._options.multiSelect) {
                        selectedValue = [];
                        result.forEach((item) => {
                            selectedValue.push(item.get(this._options.keyProperty));
                        });
                    } else {
                        selectedValue = result.at(0).get(this._options.keyProperty);
                    }
                    this._handleSelectedKeysChanged(event, selectedValue);
                }
            }
        };
        showSelector(this, popupOptions, this._options.multiSelect);
    }

    protected _handleTextValueChanged(event: SyntheticEvent, value: string): void {
        this._textValue = value;
    }

    protected _handleLookupClick(): void {
        this._children.lookupEditor.showSelector();
    }
}

export default LookupEditor;
