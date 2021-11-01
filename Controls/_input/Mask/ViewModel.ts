import {FormatBuilder, Formatter} from 'Controls/decorator';
import InputProcessor = require('Controls/_input/Mask/InputProcessor');
import {ViewModel as BaseViewModel} from 'Controls/_input/Base/ViewModel';
import isMaskFormatValid from 'Controls/_input/Mask/isFormatValid';

      /**
       * @class Controls/_input/Text/ViewModel
       * @private
       * @author Красильников А.С.
       */
      var _private = {
         updateFormatMaskChars: function(self, formatMaskChars) {
            if (self._formatMaskChars === formatMaskChars) {
               return;
            }
            self._formatMaskChars = formatMaskChars;
            self._nextVersion();
            self.formatMaskCharsRegExp = new RegExp('[' + Object.keys(formatMaskChars).join('') + ']', 'g');
         },

         prepareSplitValue: function(result) {
            var position = result.position;
            var before = result.value.substring(0, position);
            var after = result.value.substring(position, result.value.length);

            return {
               before: before,
               after: after,
               insert: '',
               delete: ''
            };
         },
      };

      class ViewModel extends BaseViewModel {
         protected _shouldShiftReplacer: boolean = true;
         constructor(...args: any[]) {
            super(...args);
            this.setCarriageDefaultPosition(0);
         }

         _convertToValue(displayValue) {
            let value;
            if (Array.isArray(this.options.mask)) {
               this.options.mask.some((mask) => {
                  value = this._getValue(displayValue, mask);
                  return !!value;
               });
            } else {
               value = this._getValue(displayValue, this.options.mask);
            }

            return value || '';
         }

         _getValue(displayValue, mask): string {
            this._format = FormatBuilder.getFormat(mask, this.options.formatMaskChars, this.options.replacer);
            const value = Formatter.clearData(this._format, displayValue)?.value || '';
            return value;
         }

         _convertToDisplayValue(value) {
            let mask = this._getMask(value);
            this._format = FormatBuilder.getFormat(mask, this.options.formatMaskChars, this.options.replacer);
            this._nextVersion();
            const fValue = value === null ? '' : value;
            _private.updateFormatMaskChars(this, this.options.formatMaskChars);
            const fData = Formatter.formatData(this._format, {value: fValue, carriagePosition: 0});
            if (fData) {
               return fData.value;
            } else {
               if (this.options.replacer) {
                  return mask.replace(this.formatMaskCharsRegExp, this.options.replacer);
               }
               return '';
            }
         }

         private _getMask(value: string): string {
            if (!value) {
               let resMask = this._options.mask;
               if (Array.isArray(this._options.mask)) {
                  resMask = this._options.mask[0];
               }
               return resMask;
            }

            const value = value.replace(/[^A-Za-z0-9]+/g, '');
            let mask;
            if (Array.isArray(this._options.mask)) {
               this._options.mask.some((curMask) => {
                  const maskValid = isMaskFormatValid(value, curMask);
                  if (maskValid) {
                     mask = curMask;
                  }
                  return maskValid;
               });
               mask = mask || this._options.mask[0];
            } else {
               mask = this._options.mask;
            }
            return mask;
         }

         private _getFormattedValue(): string {
            const mask = this._getMask(this.newValue);
            const re = /[^A-Za-z0-9]+/g;

            const value = this.newValue.replace(re, '');
            const format = FormatBuilder.getFormat(mask, this.options.formatMaskChars, this.options.replacer);
            const formatData = Formatter.formatData(format, {value, carriagePosition: 0});
            return formatData?.value;
         }

         handleInput(splitValue: object, inputType: string): boolean {
            const results = [];
            let result;
            let formattedValue;
            if (Array.isArray(this.options.mask)) {
               formattedValue = this._getFormattedValue();
               this.options.mask.forEach((curMask) => {
                  result = this._getInputProcessorResult(splitValue, inputType, curMask);
                  results.push(result);
               });
            } else {
               result = this._getInputProcessorResult(splitValue, inputType, this.options.mask);
               results.push(result);
            }

            const matchResult = this._getBestMatchResult(results, formattedValue);
            return super.handleInput.call(this, _private.prepareSplitValue(matchResult));
         }

         private _getBestMatchResult(results: object[], resValue: string): object {
            const index = results.map((res) => {
               if (res) {
                  return res.value;
               }
            }).indexOf(resValue);

            // Если ничего не нашли, то будем считать по кол-ву символов (буквам, цифрам). Не найтись маска может,
            // в таком случае: L 123 [тут каретка]2, нажали backspace, то удалится только пробел, а нужно
            // будет удалить 3.
            // Почему не подходит подсчет только по кол-ву символов: Задано значение L 123, выделяем цифры и
            // пишем букву s. В masks задано ['L ddd', 'xxxxxx']. Ожидаем получить значение Ls, но значением не
            // поменяется т.к по первой маске введенный символ не пройдет, символов будет больше и выберется L ddd маска
            if (index === -1 || resValue === undefined) {
               const valuesLength = [];
               results.forEach((res) => {
                  if (res) {
                     valuesLength.push((res.value.replace(/[^A-Za-z0-9]+/g, '').length));
                  }
               });
               const maxValueLength = Math.max(...valuesLength);
               return results[results.findIndex((res) => {
                  if (res) {
                     return (res.value.replace(/[^A-Za-z0-9]+/g, '').length === maxValueLength);
                  } else {
                     return;
                  }
               })];
            } else {
               return results[index];
            }
         }

         private _getInputProcessorResult(splitValue: object, inputType: string, mask: string): boolean {
            this._format = FormatBuilder.getFormat(mask, this.options.formatMaskChars, this.options.replacer);
            this._nextVersion();
            _private.updateFormatMaskChars(this, this.options.formatMaskChars);
            const result = InputProcessor.input(splitValue, inputType, this.options.replacer, this._format,
                this._format, this.newValue, this._shouldShiftReplacer);
            return result;
         }

         setCarriageDefaultPosition(currentPosition?: number) {
             let selection = this._getCarriageDefaultPosition(currentPosition);
             if (selection !== currentPosition || selection !== this.selection.start) {
                this.selection = selection;
                this._nextVersion();
                this._shouldBeChanged = true;
             }
         }

         private _getCarriageDefaultPosition(currentPosition?: number): number {
            let
               position,
               isFiled;

            if (this.options.replacer) {
               position = this.displayValue.indexOf(this.options.replacer);
               isFiled = position === -1;
               if (currentPosition === undefined) {
                  currentPosition = isFiled ? 0 : position;
               }
               return isFiled ? currentPosition : Math.min(currentPosition, position);
            }
            return currentPosition === undefined ? this.displayValue.length : currentPosition;
         }
      }

export = ViewModel;
