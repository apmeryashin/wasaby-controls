import BaseViewModel = require('Controls/_input/Base/ViewModel');
import InputProcessor = require('Controls/_input/Mask/InputProcessor');
import {FormatBuilder, Formatter, phoneMask, REPLACER, FORMAT_MASK_CHARS} from 'Controls/decorator';

/**
 * @class Controls/_input/Text/ViewModel
 * @private
 * @author Красильников А.С.
 */

const _private = {
    NOT_PHONE_NUMBER_SYMBOLS_REGEXP: /[^0-9+]/g,

    updateFormat(self, value) {
        const mask = phoneMask(value);

        self._format = FormatBuilder.getFormat(mask, FORMAT_MASK_CHARS, REPLACER);
        self._nextVersion();
    },

    prepareData(result) {
        const position = result.position;

        return {
            before: result.value.substring(0, position),
            after: result.value.substring(position, result.value.length),
            insert: '',
            delete: ''
        };
    }
};

const ViewModel = BaseViewModel.extend({
    _format: null,

    _convertToValue(displayValue) {
        _private.updateFormat(this, displayValue);

        return Formatter.clearData(this._format, displayValue).value;
    },

    _convertToDisplayValue(value) {
        const stringValue = value === null ? '' : value;

        _private.updateFormat(this, stringValue);

        const data = Formatter.formatData(this._format, {
            value: stringValue,
            carriagePosition: 0
        });
        if (data) {
            return data.value;
        }
        return '';
    },

    handleInput(splitValue, inputType) {
        // Let the user past phone numbers from buffer in any format. Clear data from unnecessary characters.
        splitValue.insert = splitValue.insert.replace(_private.NOT_PHONE_NUMBER_SYMBOLS_REGEXP, '');
        /**
         * Если был удален разделитель через backspace или delete, то нужно удалить цифру стоящую
         * после него или перед соответственно. Для этого нужно очистить splitValue от разделителей, а
         * потом удалить цифру, в зависимости от способа(backspace или delete).
         */
        const clearSplitValue = InputProcessor.getClearSplitValue(
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
        const result = InputProcessor.input(splitValue, inputType, REPLACER, this._format, newFormat);

        return ViewModel.superclass.handleInput.call(this, _private.prepareData(result), inputType);
    },

    isFilled() {
        const value = this._value === null ? '' : this._value;
        const mask = phoneMask(value);
        const keysRegExp = new RegExp('[' + Object.keys(FORMAT_MASK_CHARS).join('|') + ']', 'g');
        const maskOfKeys = mask.match(keysRegExp);

        return value.length === maskOfKeys.length;
    },

    moveCarriageToEnd() {
        this.selection = this.displayValue.length;
        this._nextVersion();
        this._shouldBeChanged = true;
    }
});

export = ViewModel;
