define(
   [
      'Env/Env',
      'Controls/_scroll/Scroll/ScrollHeightFixUtil',
   ],
   function(Env, ScrollHeightFixUtil) {
      'use strict';


      let oldDetectionValue;
      let oldIsBrowserPlatform;
      const mockDetection = (envField) => {
         oldDetectionValue = Env.detection[envField];
         Env.detection[envField] = true;
      };
      const restoreDetection = (envField) => {
         if (typeof window === 'undefined') {
            Env.detection[envField] = undefined;
         } else {
            Env.detection[envField] = oldDetectionValue;
         }
      };
      const mockIsBrowserPlatform = () => {
         oldIsBrowserPlatform = Env.constants.isBrowserPlatform;
         Env.constants.isBrowserPlatform = true;
      };

      const restoreIsBrowserPlatform = () => {
         Env.constants.isBrowserPlatform = oldIsBrowserPlatform;
      };

      describe('Controls.Container.Scroll.Utils', function() {
         let result;

         describe('calcHeightFixFn', function() {
            var container;
            it('chrome', function() {
               mockDetection('chrome');
               mockIsBrowserPlatform();

               result = ScrollHeightFixUtil.calcHeightFix();
               assert.equal(result, false);
               restoreDetection('chrome');
               restoreIsBrowserPlatform();
            });
            it('firefox', function() {
               mockDetection('firefox');
               mockIsBrowserPlatform();

               container = {
                  offsetHeight: 10,
                  scrollHeight: 10
               };
               result = ScrollHeightFixUtil.calcHeightFix(container);
               assert.equal(result, true);

               container = {
                  offsetHeight: 40,
                  scrollHeight: 40
               };
               result = ScrollHeightFixUtil.calcHeightFix(container);
               assert.equal(result, false);
               restoreDetection('firefox');
               restoreIsBrowserPlatform();
            });

            it('ie', function() {
               mockDetection('isIE');
               mockIsBrowserPlatform();

               container = {
                  scrollHeight: 101,
                  offsetHeight: 100
               };
               result = ScrollHeightFixUtil.calcHeightFix(container);
               assert.equal(result, true);

               container = {
                  scrollHeight: 200,
                  offsetHeight: 100
               };
               result = ScrollHeightFixUtil.calcHeightFix(container);
               assert.equal(result, false);
               restoreDetection('isIE');
               restoreIsBrowserPlatform();
            });
         });
      });
   }
);
