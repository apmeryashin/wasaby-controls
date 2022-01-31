import {ViewModel as BaseViewModel} from 'Controls/_input/Base/ViewModel';
import InputProcessor = require('Controls/_input/Mask/InputProcessor');
import {FormatBuilder, Formatter, phoneMask, REPLACER, FORMAT_MASK_CHARS, IFormat} from 'Controls/decorator';
import {InputType, ISplitValue} from 'Controls/_input/resources/Types';
import {IInputConfig} from 'Controls/_input/Mask/InputProcessor';

/**
 * @class Controls/_input/Text/ViewModel
 * @private
 * @author Мочалов М.А.
 */
const NOT_PHONE_NUMBER_SYMBOLS_REGEXP = /[^0-9+]/g;

export class ViewModel extends BaseViewModel {
    protected _format: IFormat;
    private _updateFormat(value: string): void {
        const mask = phoneMask(value);
        this._format = FormatBuilder.getFormat(mask, FORMAT_MASK_CHARS, REPLACER);
        this._nextVersion();
    }
    private _prepareData(result: IInputConfig): ISplitValue {
        const position = result.position;
        return {
            before: result.value.substring(0, position),
            after: result.value.substring(position, result.value.length),
            insert: '',
            delete: ''
        };
    }
    protected _convertToValue(displayValue: string): string {
        this._updateFormat(displayValue);
        return Formatter.clearData(this._format, displayValue).value;
    }
    protected _convertToDisplayValue(value: string): string {
        const stringValue = value === null ? '' : value;
        this._updateFormat(stringValue);
        const data = Formatter.formatData(this._format, {
            value: stringValue,
            carriagePosition: 0
        });
        if (data) {
            return data.value;
        }
        return '';
    }
    protected handleInput(splitValue: ISplitValue, inputType: InputType): boolean {
        // Let the user past phone numbers from buffer in any format. Clear data from unnecessary characters.
        splitValue.insert = splitValue.insert.replace(NOT_PHONE_NUMBER_SYMBOLS_REGEXP, '');
        /**
         * Если был удален разделитель через backspace или delete, то нужно удалить цифру стоящую
         * после него или перед соответственно. Для этого нужно очистить splitValue от разделителей, а
         * потом удалить цифру, в зависимости от способа(backspace или delete).
         */
        const clearSplitValue: ISplitValue = InputProcessor.getClearSplitValue(
            splitValue,
            Formatter.clearData(this._format, this._displayValue)
        );
        if (!clearSplitValue.delete) {
            switch (inputType) {
                case 'deleteForward':
                    clearSplitValue.after = clearSplitValue.after.substring(1);
                    break;
                case 'deleteBackward':
                    clearSplitValue.before = clearSplitValue.before.slice(0, -1);
                    break;
                default:
                    break;
            }
        }
        const newMask = phoneMask(clearSplitValue.before + clearSplitValue.insert + clearSplitValue.after);
        const newFormat = FormatBuilder.getFormat(newMask, FORMAT_MASK_CHARS, REPLACER);
        const result: IInputConfig =
            InputProcessor.input(splitValue, inputType, REPLACER, this._format, newFormat, undefined, undefined);
        return super.handleInput.call(this, this._prepareData(result), inputType);
    }
    protected isFilled(): boolean {
        const value = this._value === null ? '' : this._value;
        const mask = phoneMask(value);
        const keysRegExp = new RegExp('[' + Object.keys(FORMAT_MASK_CHARS).join('|') + ']', 'g');
        const maskOfKeys = mask.match(keysRegExp);
        return value.length === maskOfKeys.length;
    }
    protected moveCarriageToEnd(): void {
        this.selection = this.displayValue.length;
        this._nextVersion();
        this._shouldBeChanged = true;
    }
}
