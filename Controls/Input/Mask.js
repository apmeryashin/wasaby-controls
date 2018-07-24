define('Controls/Input/Mask',
   [
      'Core/IoC',
      'Core/Control',
      'Core/helpers/Object/isEqual',
      'Controls/Input/Mask/ViewModel',
      'Core/helpers/Function/runDelayed',
      'tmpl!Controls/Input/Mask/Mask',
      'Controls/Input/resources/InputRender/InputRender',
      'tmpl!Controls/Input/resources/input'
   ],
   function(IoC, Control, isEqual, ViewModel, runDelayed, MaskTpl) {

      'use strict';

      /**
       * Input for entering text with a specified format.
       * <a href="https://wi.sbis.ru/materials/demo-ws4-input">Демо-пример</a>.
       *
       * @class Controls/Input/Mask
       * @extends Core/Control
       * @mixes Controls/Input/interface/IInputTag
       * @mixes Controls/Input/interface/IInputText
       * @mixes Controls/Input/interface/IValidation
       * @mixes Controls/Input/interface/IInputPlaceholder
       * @control
       * @public
       * @category Input
       * @demo Controls-demo/Input/Mask/Mask
       */

      /**
       * @name Controls/Input/Mask#mask
       * @cfg {String} Input mask.
       *
       * Mask can use the following keys:
       * <ol>
       *    <li>d - digit.</li>
       *    <li>L - uppercase letter.</li>
       *    <li>l - lowercase letter.</li>
       *    <li>x - letter or digit.</li>
       * </ol>
       * delimeters and quantifiers +, *, ?, {n[, m]}.
       * Quantifiers should be preceded with "\".
       * Quantifiers should be applied to keys.
       * Format is similar to regular expressions.
       *
       * @example
       * <pre>
       *    1. 'dd.dd' - the input mask time.
       *    2. 'dd.dd.dddd' - the input mask date.
       *    3. 'd\{1,3}l\{1,3}'.
       *    4. 'd\*' - the input mask infinity number of digits.
       * </pre>
       */

      /**
       * @name Controls/Input/Mask#replacer
       * @cfg {String} Symbol that will be shown when character is not entered.
       *
       * @remark If quantifiers are used in the mask, the replacer cannot be set.
       * Correct operation is not supported.
       *
       * @example
       * <pre>
       *    For example, mask='dd.dd', replacer=' ', value='12.34'.
       *    If you erase everything from input, the field will change from '12.34' to '  .  '.
       * </pre>
       */

      /**
       * @name Controls/Input/Mask#formatMaskChars
       * @cfg {Object} The key is the mask character, the value is the input characters,
       * in the form of regular expression.
       */

      var
         _private = {
            regExpQuantifiers: /\\({.*?}|.)/,

            findLastUserEnteredCharPosition: function(value, replacer) {
               var position;

               if (replacer) {
                  position = value.indexOf(replacer);

                  return position === -1 ? value.length : position;
               } else {
                  return value.length;
               }
            },

            /**
             * If there's no symbol at selected position,
             * set caret to the position following the last user-entered character.
             * @param input
             * @param selectedPosition
             * @param value
             * @param replacer
             */
            setCaretPosition: function(input, selectedPosition, value, replacer) {
               var position = _private.findLastUserEnteredCharPosition(value, replacer);

               if (position < selectedPosition) {
                  input.setSelectionRange(position, position);
               }
            },
            validateReplacer: function(replacer, mask) {
               var validation;

               if (replacer && _private.regExpQuantifiers.test(mask)) {
                  validation = false;
                  IoC.resolve('ILogger').error('Mask', 'Used not empty replacer and mask with quantifiers. More on https://wi.sbis.ru/docs/js/Controls/Input/Mask/options/replacer/');
               } else {
                  validation = true;
               }

               return validation;
            },
            calcReplacer: function(replacer, mask) {
               return _private.validateReplacer(replacer, mask) ? replacer : '';
            }
         },
         Mask = Control.extend({
            _template: MaskTpl,

            _viewModel: null,

            _beforeMount: function(options) {
               this._viewModel = new ViewModel({
                  value: options.value,
                  mask: options.mask,
                  replacer: _private.calcReplacer(options.replacer, options.mask),
                  formatMaskChars: options.formatMaskChars
               });
            },

            _beforeUpdate: function(newOptions) {
               if (!(
                  newOptions.value === this._options.value &&
                  newOptions.mask === this._options.mask &&
                  newOptions.replacer === this._options.replacer &&
                  isEqual(newOptions.formatMaskChars, this._options.formatMaskChars))
               ) {
                  this._viewModel.updateOptions({
                     value: newOptions.value,
                     mask: newOptions.mask,
                     replacer: _private.calcReplacer(newOptions.replacer, newOptions.mask),
                     formatMaskChars: newOptions.formatMaskChars
                  });
               }
            },

            _focusinHandler: function() {
               var
                  input = this._children.input,
                  value = this._options.value,
                  replacer = this._options.replacer;

               /**
                * At the moment of focus, the selectionEnd property is not set.
                */
               runDelayed(function() {
                  _private.setCaretPosition(input, input.selectionEnd, value, replacer);
               });
            }
         });

      Mask.getDefaultOptions = function() {
         return {
            value: '',
            replacer: '',
            formatMaskChars: {
               'L': '[А-ЯA-ZЁ]',
               'l': '[а-яa-zё]',
               'd': '[0-9]',
               'x': '[А-ЯA-Zа-яa-z0-9ёЁ]'
            }
         };
      };

      Mask._private = _private;

      return Mask;
   });
