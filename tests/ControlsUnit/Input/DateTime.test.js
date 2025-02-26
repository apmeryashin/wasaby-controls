define([
   'Core/core-merge',
   'Controls/date',
   'ControlsUnit/Calendar/Utils',
   'Core/constants'
], function(
   cMerge,
   date,
   calendarTestUtils,
   constants
) {
   'use strict';

   const
       options = {
         mask: 'DD.MM.YYYY',
         value: new Date(2018, 0, 1),
         replacer: ' ',
      },
      optionsWithEmptyDate = {
         mask: 'DD.MM.YYYY',
         replacer: ' ',
      };

   describe('Controls/_date/BaseInput', function() {
      describe('Initialisation', function() {
         it('should create correct model', function() {
            const component = calendarTestUtils.createComponent(date.BaseInput, options);
            assert(component._model);
            assert.strictEqual(component._model._mask, options.mask);
            assert.strictEqual(component._model.value, options.value);
            assert.strictEqual(component._model._lastValue, options.value);
            assert.strictEqual(component._model.textValue, '01.01.2018');
         });

         describe('validators', function() {
            it('should create validators list.', function() {
               const
                  validators = [
                     function() {},
                     {
                        validator: function() {}
                     }, {
                        validator: function() {},
                        arguments: {}
                     }
                  ],
                  component = calendarTestUtils.createComponent(date.BaseInput,
                     cMerge({ valueValidators: validators }, options, { preferSource: true }));

               assert.isArray(component._validators);
               assert.lengthOf(component._validators, 4);
            });

            it('should validate partial value in partial mode.', function() {
               const component = calendarTestUtils.createComponent(date.BaseInput,
                     cMerge({ inputMode: 'partial', displayValue: '  .  .21'}, options, { preferSource: true }));

               assert.isArray(component._validators);
               assert.isEmpty(component._validators);
            });

            it('should update validators if displayValue changed.', function() {
               const newOptions = cMerge({ inputMode: 'partial', displayValue: '  .  .21'}, options, { preferSource: true })
               const component = calendarTestUtils.createComponent(date.BaseInput, newOptions);

               assert.isEmpty(component._validators);

               newOptions.displayValue = '01.01.21';
               sinon.stub(component, 'setValidationResult');
               component._beforeUpdate(newOptions);
               assert.isNotEmpty(component._validators);
               sinon.restore();
            });
         });

      });

      describe('_beforeUpdate', function() {
         it('should update the model', function() {
            const component = calendarTestUtils.createComponent(date.BaseInput, options),
               value = new Date(2017, 11, 1);
            sinon.stub(component, 'setValidationResult');

            component._beforeUpdate(cMerge({ value: value }, options, { preferSource: true }));

            assert.strictEqual(component._model.value, value);
            assert.strictEqual(component._model.textValue, '01.12.2017');
            sinon.restore();
         });
      });

      describe('_inputCompletedHandler', function() {
         it('should update model and generate events', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(date.BaseInput, options),
               textValue = '01.12.2017',
               value = new Date(2017, 11, 1),
               event = {
                  stopImmediatePropagation: sinon.fake()
               };

            sandbox.stub(component, '_notify');
            component._inputCompletedHandler(event, '01122017', textValue);

            assert.strictEqual(component._model.value.getTime(), value.getTime());
            assert.strictEqual(component._model.textValue, textValue);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            sinon.assert.calledOnce(event.stopImmediatePropagation);

            sandbox.restore();
         });
      });

      describe('_valueChangedHandler', function() {
         it('should update the model', function() {
            const sandbox = sinon.sandbox.create(),
               event = {
                  stopImmediatePropagation: sinon.fake()
               },
               component = calendarTestUtils.createComponent(date.BaseInput, options),
               textValue = '01.12.2017',
               value = new Date(2017, 11, 1);

            sandbox.stub(component, '_notify');
            component._valueChangedHandler(event, '01122017', textValue);

            assert.strictEqual(component._model.value.getTime(), value.getTime());
            assert.strictEqual(component._model.textValue, textValue);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.called(event.stopImmediatePropagation);

            sandbox.restore();
         });
      });

      describe('_beforeUnmount', function() {
         it('should destroy the model', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(date.BaseInput, options);

            sandbox.stub(component._model, 'destroy');
            component._beforeUnmount();

            sinon.assert.calledOnce(component._model.destroy);

            sandbox.restore();
         });
      });

      describe('_onKeyDown', function() {
         it('should set current date on insert key press', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(
                  date.BaseInput, cMerge({ dateConstructor: Date }, options, { preferSource: true })),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.insert
                  },
                  stopImmediatePropagation: sinon.fake(),
                  preventDefault: sinon.fake()
               };
            sandbox.stub(component, '_notify');
            component._onKeyDown(event);
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            const model = component._model;
            const converter = new date.StringValueConverter();
            assert.deepEqual(model.value, converter.getCurrentDate(model._lastValue, model._mask));
            assert.instanceOf(model.value, Date);
            sandbox.restore();
         });

         it('should not set date on insert + shift key press', function() {
            const
               component = calendarTestUtils.createComponent(
                  date.BaseInput, cMerge({ dateConstructor: Date }, optionsWithEmptyDate, { preferSource: true })),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.insert,
                     ctrlKey: false,
                     shiftKey: true
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            component._onKeyDown(event);
            const model = component._model;
            assert.isUndefined(model.value);
         });

         it('should not set date on insert + ctrl key press', function() {
            const
               component = calendarTestUtils.createComponent(
                  date.BaseInput, cMerge({ dateConstructor: Date }, optionsWithEmptyDate, { preferSource: true })),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.insert,
                     ctrlKey: true,
                     shiftKey: false
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            component._onKeyDown(event);
            const model = component._model;
            assert.isUndefined(model.value);
         });

         it('should increase current date on one day by plus key press', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(date.BaseInput, options),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.plus
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            const model = component._model;
            const converter = new date.StringValueConverter();
            const currentDate = converter.getCurrentDate(model._lastValue, model._mask);
            model.value = currentDate;
            sandbox.stub(component, '_notify');
            component._onKeyDown(event);
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            const localDate = new Date(currentDate);
            localDate.setDate(localDate.getDate() + 1);
            assert.deepEqual(model.value, localDate);
            sandbox.restore();
         });

         it('should decrease current date on one day by minus key press', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(date.BaseInput, options),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.minus
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            const model = component._model;
            const converter = new date.StringValueConverter();
            const currentDate = converter.getCurrentDate(model._lastValue, model._mask);
            model.value = currentDate;
            component._onKeyDown(event);
            const localDate = new Date(currentDate);
            localDate.setDate(localDate.getDate() - 1);
            assert.deepEqual(model.value, localDate);
            sandbox.restore();
         });

         it('should not change date, if value is empty', function(){
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(date.BaseInput, optionsWithEmptyDate);
            [{
               nativeEvent: {
                  keyCode: constants.key.minus
               },
               stopImmediatePropagation: sinon.fake()
            }, {
               nativeEvent: {
                  keyCode: constants.key.plus
               },
               stopImmediatePropagation: sinon.fake()
            }].forEach(function (event) {
               component._onKeyDown(event);
               const model = component._model;
               assert.isUndefined(model.value);
            });
            sandbox.restore();
         });
      });

      describe('_valueChanged', () => {
         [{
            value: [new Date('invalid'), '00.00.00'],
            text: 'should not notify Invalid Date',
            shouldNotify: false
         }, {
            value: [new Date(2021, 0, 1), '01.01.21'],
            text: 'should notify valid date',
            shouldNotify: true
         }, {
            value: [null, '  .  .  '],
            text: 'should notify valid null',
            shouldNotify: true
         }].forEach((test) => {
            it(test.text, () => {
               const component = calendarTestUtils.createComponent(date.BaseInput, {});
               sinon.stub(component, '_notify');
               sinon.stub(component, '_updateValidators');

               component._valueChanged(test.value);
               if (test.shouldNotify) {
                  sinon.assert.calledOnce(component._notify);
               } else {
                  sinon.assert.notCalled(component._notify);
               }
               sinon.restore();
            });
         });
      });
   });
});
