define(
   [
      'js!Controls/Popup/Manager',
      'js!Controls/Popup/Opener/BaseStrategy',
      'js!Controls/Popup/Controller'
   ],

   function (Manager, BaseStrategy, Controller) {
      'use strict';
      describe('Controls/Popup/Manager', function () {
         var id, element;
         it('initialize', function() {
            assert.equal(Manager._popupItems.getCount(), 0);
         });

         it('append popup', function() {
            var
               controller = new Controller();
            id = Manager.show({
               testOption: 'created'
            }, new BaseStrategy(), controller);
            assert.equal(Manager._popupItems.getCount(), 1);
         });

         it('find popup', function() {
            element = Manager.find(id);
            assert.equal(element.popupOptions.testOption, 'created');
         });

         it('update popup', function() {
            Manager.update(id, {
               testOption: 'updated'
            });
            assert.equal(Manager._popupItems.getCount(), 1);
            element = Manager.find(id);
            assert.equal(element.popupOptions.testOption, 'updated');
         });

         it('remove popup', function() {
            Manager.remove(id);
            assert.equal(Manager._popupItems.getCount(), 0);
         });
      });
   }
);