import {FormatBuilder, Formatter} from 'Controls/decorator';
import InputProcessor = require('Controls/_input/Mask/InputProcessor');
import BaseViewModel = require('Controls/_input/Base/ViewModel');
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
            // this._format = FormatBuilder.getFormat(mask, this.options.formatMaskChars, this.options.replacer);
            // const value = Formatter.clearData(this._format, displayValue)?.value || '';
            // return value;
         }

         _getValue(displayValue, mask): string {
            this._format = FormatBuilder.getFormat(mask, this.options.formatMaskChars, this.options.replacer);
            const value = Formatter.clearData(this._format, displayValue)?.value || '';
            return value;
         }

         _getMask(value: string): string {
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

         private _getMask1(): string {
            if (Array.isArray(this.options.mask)) {
               
            }
            const maskValid = isMaskFormatValid(value, curMask);
         }

         handleInput(splitValue: object, inputType: string): boolean {
            const results = [];
            let result;
            if (Array.isArray(this.options.mask)) {
               this.options.mask.forEach((curMask) => {
                  result = this._checkMask(splitValue, inputType, curMask);
                  results.push(result);
               });
               // const result = this.options.mask.some((mask) => {
               //    return this._checkMask(splitValue, inputType, mask);
               // });
               // return result;

               //const value = splitValue.before + splitValue.delete


            } else {
               result = this._checkMask(splitValue, inputType, this.options.mask);
               results.push(result);
            }

            const matchResult = this._getMatchResult(results);
            return super.handleInput.call(this, _private.prepareSplitValue(matchResult));
            //return true;
         }

         private _getMatchResult(results: object[]): object {
            const valuesLength = [];
            results.forEach((res) => {
               if (res) {
                  valuesLength.push((res.value.replaceAll(/[^A-Za-z0-9]+/g, '').length);
               }
            });
            const maxValueLength = Math.max(...valuesLength);
            return results[results.findIndex((res) => {
               if (res) {
                  return (res.value.replaceAll(/[^A-Za-z0-9]+/g, '').length === maxValueLength;
               } else {
                  return;
               }
            })];
         }

         private _checkMask(splitValue: object, inputType: string, mask: string): boolean {
            this._format = FormatBuilder.getFormat(mask, this.options.formatMaskChars, this.options.replacer);
            this._nextVersion();
            _private.updateFormatMaskChars(this, this.options.formatMaskChars);
            const result = InputProcessor.input(splitValue, inputType, this.options.replacer, this._format, this._format, this._value);
            return result;


            // if (!result) {
            //    return false;
            // }
            // return super.handleInput.call(this, _private.prepareSplitValue(result));
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
