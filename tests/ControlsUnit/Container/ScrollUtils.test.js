define(
   [
      'Env/Env',
      'Controls/_scroll/Scroll/ScrollHeightFixUtil'
   ],
   function(Env, ScrollHeightFixUtil) {

      'use strict';

      var
         mockEnv = function(envField) {
            oldEnvValue = Env.detection[envField];
            Env.detection[envField] = true;
         },
         restoreEnv = function(envField) {
            if (typeof window === 'undefined') {
               Env.detection[envField] = undefined;
            } else {
               Env.detection[envField] = oldEnvValue;
            }
         },
         oldEnvValue;

      describe('Controls.Container.Scroll.Utils', function() {
         let result;

         describe('calcOverflow', function() {
            var container;
            it('chrome', function() {
               mockEnv('chrome');

               result = ScrollHeightFixUtil.calcHeightFix();
               assert.equal(result, false);
               restoreEnv('chrome');
            });
            it('firefox', function() {
               mockEnv('firefox');

               container = {
                  offsetHeight: 10,
                  scrollHeight: 10
               };
               result = ScrollHeightFixUtil.calcHeightFix(container);
               if (window) {
                  assert.equal(result, true);
               } else {
                  assert.equal(result, undefined);
               }

               container = {
                  offsetHeight: 40,
                  scrollHeight: 40
               };
               result = ScrollHeightFixUtil.calcHeightFix(container);
               if (window) {
                  assert.equal(result, false);
               } else {
                  assert.equal(result, undefined);
               }
               restoreEnv('firefox');
            });
         });
      });
   }
);
