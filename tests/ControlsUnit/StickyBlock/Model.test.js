define(
   [
      'Controls/_scroll/StickyBlock/Model'
   ],
   function(Model) {

      'use strict';

      describe('Controls/_scroll/StickyBlock/Model', function() {
         var topTarget = {};
         var bottomLeftTarget = {};
         var bottomRightTarget = {};
         var result, model;

         describe('constructor', function() {
            beforeEach(function() {
               model = new Model({
                  topTarget: topTarget,
                  bottomLeftTarget: bottomLeftTarget
               });
            });

            it('Create a component', function() {
               result = model.fixedPosition;

               assert.equal(result, '');
            });
         });
         describe('update', function() {
            describe('position top', function() {
               beforeEach(function() {
                  model = new Model({
                     topTarget: topTarget,
                     bottomLeftTarget: bottomLeftTarget,
                     bottomRightTarget: bottomRightTarget,
                     position: {
                        vertical: 'top'
                     }
                  });
               });

               it('Both targets not intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: false
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: false
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, '');
               });
               it('The top target not intersection and the bottom target intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: false
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: true
                     },
                     {
                        target: bottomRightTarget,
                        isIntersecting: true
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, 'top');
               });
               it('The top target intersection and the bottom target not intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: true
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: false
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, '');
               });
               it('Both targets intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: true
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: true
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, '');
               });
            });
            describe('position bottom', function() {
               beforeEach(function() {
                  model = new Model({
                     topTarget: topTarget,
                     bottomLeftTarget: bottomLeftTarget,
                     bottomRightTarget: bottomRightTarget,
                     position: {
                        vertical: 'bottom'
                     }
                  });
               });

               it('The bottom left target intersection and the bottom right target not intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: false
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: true
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: false
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, '');
               });

               it('The top target intersection and the bottom left target intersection and the bottom right target not intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: true
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: false
                     },
                     {
                        target: bottomRightTarget,
                        isIntersecting: false
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, 'bottom');
               });

               it('Both targets not intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: false
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: false
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, '');
               });
               it('The top target not intersection and the bottom target intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: false
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: true
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, '');
               });
               it('The top target intersection and the bottom target not intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: true
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: false
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, 'bottom');
               });
               it('Both targets intersection', function () {
                  model.update([
                     {
                        target: topTarget,
                        isIntersecting: true
                     },
                     {
                        target: bottomLeftTarget,
                        isIntersecting: true
                     },
                     {
                        target: bottomRightTarget,
                        isIntersecting: true
                     }
                  ]);

                  result = model.fixedPosition;

                  assert.equal(result, '');
               });
            });
         });
      });
   }
);
