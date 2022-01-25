import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import LookupTemplate = require('wml!Controls/_filterPanel/Editors/Lookup');
import {Selector, showSelector} from 'Controls/lookup';
import * as rk from 'i18n!Controls';
import {Model} from 'Types/entity';
import 'css!Controls/filterPanel';

interface ILookupOptions extends IControlOptions {
    propertyValue: number[] | string[];
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
    protected _children: {
        lookupEditor: Selector
    };

    protected _handleCloseEditorClick(event: SyntheticEvent): void {
        const extendedValue = {
            value: this._options.propertyValue,
            textValue: '',
            viewMode: 'extended'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _handleSelectedKeysChanged(event: SyntheticEvent, value: number[] | string[]): void {
        const extendedValue = {
            value,
            textValue: this._textValue,
            viewMode: 'basic'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _extendedCaptionClickHandler(event: SyntheticEvent): void {
        const popupOptions = {
            eventHandlers: {
                onResult: (result: Model[]) => {
                    const selectedKeys = [];
                    result.forEach((item) => {
                        selectedKeys.push(item.get(this._options.keyProperty));
                    });
                    this._handleSelectedKeysChanged(event, selectedKeys);
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
