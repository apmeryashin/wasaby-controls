define(
   [
      'Controls/decorator'
   ],
   function(decorator) {

      'use strict';

      describe('Controls.Decorator.Money', function() {
         var ctrl;
         beforeEach(function() {
            ctrl = decorator.MoneyFunctions;
         });

         describe('parseNumber', function() {
            it('value: null, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(null, false, 'none', 2), {
                  number: '',
                  integer: '',
                  fraction: ''
               });
            });
            it('value: 0.035, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(0.035, false, 'none', 2), {
                  number: '0.03',
                  integer: '0',
                  fraction: '.03'
               });
            });
            it('value: 0.075, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(0.075, false, 'none', 2), {
                  number: '0.07',
                  integer: '0',
                  fraction: '.07'
               });
            });
            it('value: 20, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(20, false, 'none', 2), {
                  number: '20.00',
                  integer: '20',
                  fraction: '.00'
               });
            });
            it('value: 20.1, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(20.1, false, 'none', 2), {
                  number: '20.10',
                  integer: '20',
                  fraction: '.10'
               });
            });
            it('value: 20.18, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(20.18, false, 'none', 2), {
                  number: '20.18',
                  integer: '20',
                  fraction: '.18'
               });
            });
            it('value: 20.181, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(20.181, false, 'none', 2), {
                  number: '20.18',
                  integer: '20',
                  fraction: '.18'
               });
            });
            it('value: Infinity, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(Infinity, false, 'none', 2), {
                  number: '0.00',
                  integer: '0',
                  fraction: '.00'
               });
            });
            it('value: 1000.00, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(1000.00, false, 'none', 2), {
                  number: '1000.00',
                  integer: '1000',
                  fraction: '.00'
               });
            });
            it('value: 1000.00, useGrouping: true', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(1000.00, true, 'none', 2), {
                  number: '1 000.00',
                  integer: '1 000',
                  fraction: '.00'
               });
            });
            it('value: -1000.00, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(-1000.00, false, 'none', 2), {
                  number: '- 1000.00',
                  integer: '- 1000',
                  fraction: '.00'
               });
            });
            it('value: -1000.00, useGrouping: true', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(-1000.00, true, 'none', 2), {
                  number: '- 1 000.00',
                  integer: '- 1 000',
                  fraction: '.00'
               });
            });
            it('value: 1234e20, useGrouping: true', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(1234e20, true, 'none', 2), {
                  number: '123 400 000 000 000 000 000 000.00',
                  integer: '123 400 000 000 000 000 000 000',
                  fraction: '.00'
               });
            });
            it('value: 1290, precision: 0', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(1290, true, 'none', 0), {
                  number: '1 290',
                  integer: '1 290',
                  fraction: ''
               });
            });
         });
         describe('tooltip', function() {
            it('value: "0.00"', function() {
               assert.equal(ctrl.calculateTooltip({number: '0.00'}, {}, 2), '0.00');
            });
            it('value: "0.12"', function() {
               assert.equal(ctrl.calculateTooltip({number: '0.12'}, {}, 2), '0.12');
            });
            it('value: "0.00", tooltip: "tooltip"', function() {
               assert.equal(ctrl.calculateTooltip({number: '0.00'}, {tooltip: 'tooltip'}, 2), 'tooltip');
            });
         });
         describe('isDisplayFractionPath', function() {
            it('Test1', function() {
               assert.isFalse(ctrl.isDisplayFractionPath('.00', false, 2));
            });
            it('Test2', function() {
               assert.isTrue(ctrl.isDisplayFractionPath('.10', false, 2));
            });
            it('Test3', function() {
               assert.isTrue(ctrl.isDisplayFractionPath('.00', true, 2));
            });
            it('Test4', function() {
               assert.isTrue(ctrl.isDisplayFractionPath('.10', true, 2));
            });
            it('Test5', function() {
               assert.isFalse(ctrl.isDisplayFractionPath('.10', true, 0));
            });
         });
         describe('calculateMainClass', function() {
            it('fontColorStyle: "default", underline: "hovered"', function() {
               assert.equal(ctrl.calculateMainClass('default', 'hovered'), 'controls-DecoratorMoney controls-DecoratorMoney__underline controls-text-default');
            });
            it('fontColorStyle: "primary", underline: "none"', function() {
               assert.equal(ctrl.calculateMainClass('primary', 'none'), 'controls-DecoratorMoney controls-text-primary');
            });
            it('fontColorStyle: "primary", underline: "none", style: "style"', function() {
               assert.equal(ctrl.calculateMainClass('primary', 'none', 'style'), 'controls-DecoratorMoney controls-DecoratorMoney_style-style controls-text-primary');
            });
            it('fontColorStyle: "primary", underline: "hovered", style: "style"', function() {
               assert.equal(ctrl.calculateMainClass('primary', 'hovered', 'style'), 'controls-DecoratorMoney controls-DecoratorMoney__underline controls-DecoratorMoney_style-style controls-text-primary');
            });
         });

         describe('calculateCurrencyClass', function() {
            it('currencySize: "m", fontColorStyle: "default", fontWeight: "bold"', function() {
               assert.equal(ctrl.calculateCurrencyClass('m', 'default', 'bold'), 'controls-fontsize-m controls-text-default controls-fontweight-bold');
            });
         });

         describe('calculateStrokedClass', function() {
            it('stroked: true', function() {
               assert.equal(ctrl.calculateStrokedClass(true), 'controls-DecoratorMoney__stroked');
            });
            it('stroked: false', function() {
               assert.equal(ctrl.calculateStrokedClass(false), '');
            });
         });

         describe('calculateIntegerClass', function() {
            it('fontSize: "m", fontColorStyle: "default", fontWeight: "bold", "currency": "Euro", currencyPosition: "left", isDisplayFractionPathParam: true', function() {
               assert.equal(ctrl.calculateIntegerClass('m', 'default', 'bold', 'Euro', 'left', true), 'controls-fontsize-m controls-text-default controls-fontweight-bold controls-margin_left-2xs');
            });
            it('fontSize: "m", fontColorStyle: "default", fontWeight: "bold", "currency": "Euro", currencyPosition: "right", isDisplayFractionPathParam: false', function() {
               assert.equal(ctrl.calculateIntegerClass('m', 'default', 'bold', 'Euro', 'right', false), 'controls-fontsize-m controls-text-default controls-fontweight-bold controls-margin_right-2xs');
            });
            it('fontSize: "m", fontColorStyle: "default", fontWeight: "bold", "currency": "Euro", currencyPosition: "right", isDisplayFractionPathParam: true', function() {
               assert.equal(ctrl.calculateIntegerClass('m', 'default', 'bold', 'Euro', 'right', true), 'controls-fontsize-m controls-text-default controls-fontweight-bold');
            });
         });

         describe('calculateFractionClass', function() {
            it('fraction: ".00", fontColorStyle: "default", fractionFontSize: "bold", "currency": "Euro", currencyPosition: "left"', function() {
               assert.equal(ctrl.calculateFractionClass('.00', 'default', 'bold', 'Euro', 'left'), 'controls-DecoratorMoney__fraction__colorStyle-readonly controls-fontsize-bold');
            });
            it('fraction: ".00", fontColorStyle: "default", fractionFontSize: "bold", "currency": "Euro", currencyPosition: "right"', function() {
               assert.equal(ctrl.calculateFractionClass('.00', 'default', 'bold', 'Euro', 'right'), 'controls-DecoratorMoney__fraction__colorStyle-readonly controls-fontsize-bold controls-margin_right-2xs');
            });
            it('fraction: ".10", fontColorStyle: "default", fractionFontSize: "bold", "currency": "Euro", currencyPosition: "left"', function() {
               assert.equal(ctrl.calculateFractionClass('.10', 'default', 'bold', 'Euro', 'left'), 'controls-DecoratorMoney__fraction__colorStyle-default controls-fontsize-bold');
            });
            it('fraction: ".10", fontColorStyle: "default", fractionFontSize: "bold", "currency": "Euro", currencyPosition: "right"', function() {
               assert.equal(ctrl.calculateFractionClass('.10', 'default', 'bold', 'Euro', 'right'), 'controls-DecoratorMoney__fraction__colorStyle-default controls-fontsize-bold controls-margin_right-2xs');
            });
         });

         describe('calculateCurrency', function() {
            it('"currency": "Ruble"', function() {
               assert.equal(ctrl.calculateCurrency('Ruble'), '₽');
            });
            it('"currency": "Dollar"', function() {
               assert.equal(ctrl.calculateCurrency('Dollar'), '$');
            });
            it('"currency": "Euro"', function() {
               assert.equal(ctrl.calculateCurrency('Euro'), '€');
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

         describe('calculateTooltip', function() {
            it('number: 10, no tooltip', function() {
               const formattedNumber = {
                  number: 10,
                  fraction: 10
               };
               const options = {};
               assert.equal(ctrl.calculateTooltip(formattedNumber, options), '10');
            });
            it('number: 10, no tooltip', function() {
               const formattedNumber = {
                  number: 10,
                  fraction: 10
               };
               const options = {
                  tooltip: 'tooltip'
               };
               assert.equal(ctrl.calculateTooltip(formattedNumber, options), 'tooltip');
            });
         });

         describe('calculateFractionFontSize', function() {
            it('fontSize: "6xl"', function() {
               assert.equal(ctrl.calculateFractionFontSize('6xl'), '3xl');
            });
            it('fontSize: "7xl"', function() {
               assert.equal(ctrl.calculateFractionFontSize('7xl'), '3xl');
            });
            it('fontSize: "8xl"', function() {
               assert.equal(ctrl.calculateFractionFontSize('8xl'), '3xl');
            });
            it('fontSize: "m"', function() {
               assert.equal(ctrl.calculateFractionFontSize('m'), 'xs');
            });
         });
      });
   }
);
