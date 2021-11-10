define(
   [
      'Controls/decorator'
   ],
   function(decorator) {

      'use strict';

      describe('Controls.Decorator.Number', function() {
         var result;
         var ctrl = decorator.NumberFunctions;

         it('Zero number', function() {
            result = ctrl.calculateFormattedNumber(0, false, 'round', '0', 'none', false, {precision: 0});
            assert.equal(result, '0');
         });

         it('No fractionSize', function() {
            result = ctrl.calculateFormattedNumber(10, false, 'round', '0', 'none', false, {precision: 0});
            assert.equal(result, '10');

            result = ctrl.calculateFormattedNumber(10.01, false, 'round', '2', 'none', false, {precision: 2});
            assert.equal(result, '10.01');
         });

         it('should trim trailing zeros', function() {
            result = ctrl.calculateFormattedNumber('10.00', false, 'round', '0', 'none', false, {precision: 2});
            assert.equal(result, '10');

            result = ctrl.calculateFormattedNumber('10.1000', false, 'round', '0', 'none', false, {precision: 2});
            assert.equal(result, '10.1');

         });

         it('Add fractional path', function() {
            result = ctrl.calculateFormattedNumber(10, false, 'round', '2', 'none', true, {precision: 2});
            assert.equal(result, '10.00');

            result = ctrl.calculateFormattedNumber(10.0001, false, 'round', '0', 'none', true, {precision: 0});
            assert.equal(result, '10');
         });

         it('Remove fractional path', function() {
            result = ctrl.calculateFormattedNumber(10.123, false, 'round', '2', 'none', false, {precision: 2});
            assert.equal(result, '10.12');
         });

         it('Split into triads', function() {
            result = ctrl.calculateFormattedNumber(123456.01, true, 'round', '2', 'none', false, {precision: 2});
            assert.equal(result, '123 456.01');

            result = ctrl.calculateFormattedNumber(123456, true, 'round', '0', 'none', false, {precision: 0});
            assert.equal(result, '123 456');

            result = ctrl.calculateFormattedNumber(123456.000001, true, 'round', '6', 'none', false, {precision: 6});
            assert.equal(result, '123 456.000001');

            result = ctrl.calculateFormattedNumber(12345, true, 'round', '0', 'none', false, {precision: 0});
            assert.equal(result, '12 345');
         });

         it('Negative number', function() {
            result = ctrl.calculateFormattedNumber(-123456.000001, true, 'round', '6', 'none', false, {precision: 6});
            assert.equal(result, '- 123 456.000001');
         });

         it('Mode trunc', function() {
            result = ctrl.calculateFormattedNumber(1.234567890, false, 'trunc', '4', 'none', false, {precision: 4});
            assert.equal(result, '1.2345');

            result = ctrl.calculateFormattedNumber(1.234567890, false, 'trunc', '0', 'none', false, {precision: 0});
            assert.equal(result, '1');
         });

         describe('calculateMainClass', function() {
            it('fontSize: "m", fontColorStyle: "default", stroked: true, underline: "hovered", fontWeight: "bold"', function() {
               assert.equal(ctrl.calculateMainClass('m', 'default', true, 'hovered', 'bold'), 'controls-DecoratorNumber controls-fontsize-m controls-text-default controls-DecoratorNumber__stroked controls-DecoratorNumber__underline controls-fontweight-bold');
            });
            it('fontSize: "m", fontColorStyle: "default", stroked: false, underline: "none"', function() {
               assert.equal(ctrl.calculateMainClass('m', 'default', false, 'none', ''), 'controls-DecoratorNumber controls-fontsize-m controls-text-default controls-fontweight-default');
            });
         });

         describe('calculateMainClass', function() {
            it('fontSize: "m", fontColorStyle: "default", stroked: true, underline: "hovered", fontWeight: "bold"', function() {
               assert.equal(ctrl.calculateMainClass('m', 'default', true, 'hovered', 'bold'), 'controls-DecoratorNumber controls-fontsize-m controls-text-default controls-DecoratorNumber__stroked controls-DecoratorNumber__underline controls-fontweight-bold');
            });
            it('fontSize: "m", fontColorStyle: "default", stroked: false, underline: "none"', function() {
               assert.equal(ctrl.calculateMainClass('m', 'default', false, 'none', ''), 'controls-DecoratorNumber controls-fontsize-m controls-text-default controls-fontweight-default');
            });
         });

         describe('calculateFontColorStyle', function() {
            it('stroked: true, readOnly: true, fontColorStyle: "default"', function() {
               const options = {
                  readOnly: true,
                  fontColorStyle: 'default'
               };
               assert.equal(ctrl.calculateFontColorStyle(true, options), 'readonly');
            });
            it('stroked: true, readOnly: false, fontColorStyle: "default"', function() {
               const options = {
                  readOnly: false,
                  fontColorStyle: 'default'
               };
               assert.equal(ctrl.calculateFontColorStyle(true, options), 'readonly');
            });
            it('stroked: false, readOnly: true, fontColorStyle: "default"', function() {
               const options = {
                  readOnly: true,
                  fontColorStyle: 'default'
               };
               assert.equal(ctrl.calculateFontColorStyle(false, options), 'readonly');
            });
            it('stroked: false, readOnly: false, fontColorStyle: "default"', function() {
               const options = {
                  readOnly: false,
                  fontColorStyle: 'default'
               };
               assert.equal(ctrl.calculateFontColorStyle(false, options), 'default');
            });
         });
      });
   }
);
