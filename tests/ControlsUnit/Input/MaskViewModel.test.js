define(
   [
      'Core/core-merge',
      'Controls/_input/Mask/ViewModel'
   ],
   function(coreMerge, ViewModel) {

      'use strict';

      describe('Controls/_input/Mask/ViewModel', function() {
         var viewModel = new ViewModel({
               mask: 'DD.MM.YY',
               value: '',
               replacer: ' ',
               formatMaskChars: {
                  'D': '[0-9]',
                  'M': '[0-9]',
                  'Y': '[0-9]',
                  'H': '[0-9]',
                  'm': '[0-9]',
                  's': '[0-9]',
                  'U': '[0-9]'
               },
            }, ''), result;

         describe('_convertToDisplayValue', function() {
            it('value = null', function() {
               assert.equal(viewModel._convertToDisplayValue(null), '  .  .  ');
            });
         });
         describe('handleInput', function() {
            const viewModel1 = new ViewModel({
               mask: ['L dd d', 'L ddd ddd', 'L dd dd dd ddd', 'L d ddd ddd', 'xxxxxxxxxxxxxxxxxxxx'],
               value: '',
               replacer: '',
               formatMaskChars: {
                  L: '[А-ЯA-ZЁ]',
                  l: '[а-яa-zё]',
                  d: '[0-9]',
                  x: '[А-ЯA-Zа-яa-z0-9ёЁ]'
               }
            });

            [{
               splitValue: {
                  after: '',
                  before: 'L 12 3',
                  delete: '',
                  insert: '4'
               },
               newValue: 'L 12 34',
               result: 'L 123 4'
            }, {
               splitValue: {
                  after: '2',
                  before: 'L 111 22',
                  delete: '',
                  insert: '9 9'
               },
               newValue: 'L 11 12 29 92',
               result: 'L 11 12 29 92'
            }, {
               splitValue: {
                  after: '5',
                  before: 'L 1',
                  delete: '23 ',
                  insert: 's'
               },
               newValue: 'L 1s5',
               result: 'L1s5'
            }, {
               splitValue: {
                  after: '',
                  before: 'L123456678',
                  delete: '9',
                  insert: ''
               },
               newValue: 'L123456678',
               result: 'L 12 34 56 678'
            }, {
               splitValue: {
                  after: '11 1',
                  before: 'L ',
                  delete: '',
                  insert: 's'
               },
               newValue: 'L s11 1',
               result: 'Ls111'
            }, {
               splitValue: {
                  after: ' 3',
                  before: 'L 11 12 2',
                  delete: '2',
                  insert: ''
               },
               newValue: 'L 11 12 2 3',
               result: 'L 111 223'
            }, {
               splitValue: {
                  after: '6',
                  before: 'L 12',
                  delete: '3 45',
                  insert: ''
               },
               newValue: 'L 126',
               result: 'L 12 6'
            }].forEach(function (test) {
               it ('Array mask', () => {
                  viewModel1.newValue = test.newValue;
                  viewModel1.handleInput(test.splitValue, 'insert');
                  assert.deepEqual(viewModel1._displayValue, test.result);
               });
            });

            it ('Insert 1', () => {
               var splitValue = {
                  after: '  .  .  ',
                  before: '',
                  delete: '',
                  insert: '1'
               };
               viewModel.handleInput(splitValue, 'insert');
               assert.deepEqual(viewModel.value, '1     ');
            });
         });

         describe('setCarriageDefaultPosition', function() {
            [{
               displayValue: '12.34.56',
               replacer: ' ',
               currentPosition: 0,
               resp: 0
            }, {
               displayValue: '12.34.  ',
               replacer: ' ',
               currentPosition: 0,
               resp: 0
            }, {
               displayValue: '12.34.56',
               replacer: ' ',
               currentPosition: 4,
               resp: 4
            }, {
               displayValue: '12.34.  ',
               replacer: ' ',
               currentPosition: 7,
               resp: 6
            }, {
               displayValue: '  .  .  ',
               replacer: ' ',
               currentPosition: 0,
               resp: 0
            }, {
               displayValue: '12.34.56',
               replacer: '',
               currentPosition: undefined,
               resp: 8
            }, {
               displayValue: '12.34.',
               replacer: '',
               currentPosition: undefined,
               resp: 6
            }, {
               displayValue: '',
               replacer: '',
               currentPosition: 0,
               resp: 0
            }, {
               displayValue: '12.34.56',
               replacer: '',
               currentPosition: 3,
               resp: 3
            }].forEach(function(test) {
               it(`${test.displayValue}, ${test.replacer}, ${test.resp}`, function () {
                  var viewModel = new ViewModel({
                     mask: 'DD.MM.YY',
                     value: '',
                     replacer: test.replacer,
                     formatMaskChars: {
                        'D': '[0-9]',
                        'M': '[0-9]',
                        'Y': '[0-9]'
                     }
                  }, '');
                  viewModel.displayValue = test.displayValue;
                  viewModel.setCarriageDefaultPosition(test.currentPosition);
                  assert.equal(viewModel.selection.start, test.resp);
                  assert.equal(viewModel.selection.end, test.resp);
               });
            });
         });
      });
   }
);
