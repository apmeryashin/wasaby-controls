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
      replacer: ' ',
   };

   describe('Controls/date/DateSelector', function() {

      describe('openPopup', function() {
         it('should open opener', function() {
            const component = calendarTestUtils.createComponent(date.Selector, options);
            component._stickyOpener = {
               open: sinon.fake()
            };
            component._children = {
               linkView: {
                  getPopupTarget: sinon.stub().returns()
               }
            };
            component.openPopup();
            sinon.assert.called(component._stickyOpener.open);
         });
      });

      describe('_onResult', function() {
         it('should generate valueChangedEvent and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(date.Selector, options),
               value = new Date(2018, 11, 10);

            component._stickyOpener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._onResult(null, value);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.calledOnce(component._notify);
            sinon.assert.called(component._stickyOpener.close);
            sandbox.restore();
         });
      });
      describe('_rangeChangedHandler', function() {
         it('should generate valueChangedEvent', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(date.Selector, options),
               value = new Date(2018, 11, 10);

            component._stickyOpener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._rangeChangedHandler(null, value);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sandbox.restore();
         });
      });

      describe('_getPopupOptions', () => {
         it('should set undefined instead of null', () => {
            const component = calendarTestUtils.createComponent(date.Selector, options);
            component._children = {
               opener: {
                  open: sinon.fake()
               },
               linkView: {
                  getPopupTarget: sinon.stub().returns()
               }
            };
            component._startValue = null;
            const popupOptions = component._getPopupOptions();
            assert.isUndefined(popupOptions.startValue);
            assert.isUndefined(popupOptions.endValue);
         });
      });
   });
});
