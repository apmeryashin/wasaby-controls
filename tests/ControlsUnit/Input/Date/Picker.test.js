define([
   'Core/core-merge',
   'Controls/date',
   'ControlsUnit/Calendar/Utils'
], function(
   cMerge,
   date,
   calendarTestUtils
) {
   'use strict';

   const options = {
      mask: 'DD.MM.YYYY',
      value: new Date(2018, 0, 1),
      replacer: ' '
   };

   describe('Controls/_date/Input', function() {

      describe('openPopup', function() {
         it('should open opener with default options', function() {
            const component = calendarTestUtils.createComponent(date.Input, options);
            component._children = {
               linkView: {
                  getPopupTarget: sinon.stub().returns()
               }
            };
            sinon.stub(component._stickyOpener, 'open');
            component.openPopup();
            sinon.assert.called(component._stickyOpener.open);
            sinon.restore();
         });
         it('should open dialog with passed dialog options', function() {
            const
               extOptions = {
                  readOnly: true,
                  theme: 'default'
               },
               component = calendarTestUtils.createComponent(date.Input, extOptions),
               TARGET = 'target';
            component._children = {
               opener: {
                  open: sinon.fake()
               },
               linkView: {
                  getPopupTarget: sinon.fake()
               }
            };
            sinon.stub(component._stickyOpener, 'open');
            component.openPopup();
            sinon.assert.called(component._stickyOpener.open);
            sinon.assert.calledWith(component._stickyOpener.open, sinon.match({
               className: 'controls-PeriodDialog__picker controls_datePicker_theme-default',
               templateOptions: {
                  readOnly: extOptions.readOnly
               }
            }));
            sinon.restore();
         });
      });

      describe('_onResult', function() {
         it('should generate events and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(date.Input, options),
               value = new Date(2017, 11, 1);

            component._children = {};
            sandbox.stub(component._stickyOpener, 'close');
            sandbox.stub(component, '_notify');

            component._onResult(value);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            sinon.assert.called(component._stickyOpener.close);
            sandbox.restore();
         });
      });

      describe('_onResultWS3', function() {
         it('should generate events and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(date.Input, options),
               value = new Date(2017, 11, 1);

            component._children = {}
            sandbox.stub(component._stickyOpener, 'close');
            sandbox.stub(component, '_notify');

            component._onResultWS3(null, value);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            sinon.assert.called(component._stickyOpener.close);
            sandbox.restore();
         });
      });

      describe('_afterUpdate', function() {
         it('should start validation', function () {
            const
                component = calendarTestUtils.createComponent(date.Input, options),
                value = new Date(2017, 11, 1);

            let result = false;
            component._children = {};
            component._children.opener = {
               close: sinon.fake()
            };
            component._children.input = {
               validate: function() {
                  result = true;
               }
            };
            component._onResult(value);
            component._afterUpdate();
            assert.isTrue(result);
         });
         it('should not start validation', function () {
            const
                component = calendarTestUtils.createComponent(date.Input, options);

            let result = false;
            component._children = {};
            component._children.opener = {
               close: sinon.fake()
            };
            component._children.input = {
               validate: function() {
                  result = true;
               }
            };
            component._afterUpdate();
            assert.isFalse(result);
         });
      });
   });
});
