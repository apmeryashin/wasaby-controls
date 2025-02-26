define([
   'Controls/breadcrumbs',
   'Types/entity'
], function(
   crumbs,
   entity
) {
   describe('Controls.BreadCrumbs.View', function() {
      var bc, data;
      beforeEach(function() {
         data = [
            {
               id: 1,
               title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1',
               parent: null
            },
            {
               id: 2,
               title: 'Notebooks 2',
               parent: 1
            },
            {
               id: 3,
               title: 'Smartphones 3',
               parent: 2
            },
            {
               id: 4,
               title: 'Record1',
               parent: 3
            },
            {
               id: 5,
               title: 'Record2',
               parent: 4
            },
            {
               id: 6,
               title: 'Record3eqweqweqeqweqweedsadeqweqewqeqweqweqw',
               parent: 5
            }
         ];
         bc = new crumbs.View();
         bc.saveOptions({
            items: data.map(function(item) {
               return new entity.Model({
                  rawData: item
               });
            }),
            keyProperty: 'id',
            parentProperty: 'parent',
            displayProperty: 'test'
         });
      });
      afterEach(function() {
         bc.destroy();
         bc = null;
      });
      it('_onHoveredItemChanged', function() {
         var hoveredItem = 'hoveredItem';

         bc._notify = function(e, args) {
            if (e === 'hoveredItemChanged') {
               assert.equal(hoveredItem, args[0]);
            }
         };
         bc._onHoveredItemChanged({}, hoveredItem);
      });
      it('_addWithOverflow', function() {
         //две крошки
         let View = new crumbs.View();
         View._items = [{
            id: 1,
            item: {
               get: () => {
                  return 'title';
               }
            },
            withOverflow: false
         }, {
            id: 2,
            item: {
               get: () => {
                  return '1';
               }
            },
            withOverflow: false
         }];
         View._addWithOverflow();
         assert.isTrue(View._items[0].withOverflow);
         assert.isFalse(View._items[1].withOverflow);

         //крошка и точки
         View._items = [{
            id: 1,
            item: {
               get: () => {
                  return '...';
               }
            },
            withOverflow: false,
            isDots: true
         }, {
            id: 2,
            item: {
               get: () => {
                  return 'title';
               }
            },
            withOverflow: false
         }];
         View._addWithOverflow();
         assert.isFalse(View._items[0].withOverflow);
         assert.isTrue(View._items[1].withOverflow);
      });
      describe('_onItemClick', function() {
         const mockEvent = (e) => ({...e, stopPropagation() {}});
         it('item', function() {
            var itemData = {
               item: new entity.Model({
                  rawData: {
                     id: 2,
                     title: 'Notebooks 2'
                  }
               })
            };
            bc._notify = function(e, args) {
               if (e === 'itemClick') {
                  assert.equal(itemData.item.get('id'), args[0].get('id'));
               }
            };
            bc._onItemClick(mockEvent(), itemData);

            // check notify itemClick in readOnly mode
            var notifyClickCalled = false;
            bc._options.readOnly = true;
            bc._notify = function(e, args) {
               if (e === 'itemClick') {
                  notifyClickCalled = true;
               }
            };
            bc._onItemClick(mockEvent(), itemData);
            assert.isFalse(notifyClickCalled, 'itemClick notified in readOnly mode.');
         });
         it('dots', function() {
            var itemData = {
               item: {
                  title: '...'
               }
            };
            bc._menuOpener = {
               open: function(opener, target, options) {
                  assert.equal(target, 123);
                  assert.equal(options.templateOptions.displayProperty, 'test');
               },
               close: function() {}
            };
            bc._dotsClick({
               currentTarget: 123,
            }, itemData);

            bc._dotsClick({
               currentTarget: 123,
            }, itemData);
         });

         it('dots with option readOnly', function() {
            var itemData = {
               item: {
                  title: '...'
               }
            };
            bc._options.readOnly = true;
            let readOnly = false;

            bc._menuOpener = {
               open: function(opener, target, options) {
                  readOnly = options.templateOptions.readOnly;
               },
               close: function() {}
            };
            bc._dotsClick({
               currentTarget: 123,
            }, itemData);
            assert.isTrue(readOnly);
         });
      });
      it('_onResult', function(done) {
         var args = new entity.Model({
            rawData: data[0]
         });
         bc._notify = function(e, eventArgs) {
            if (e === 'itemClick') {
               assert.equal(bc._options.items[0].get('id'), eventArgs[0].get('id'));
            }
         };
         bc._menuOpener = {
            close: function() {
               done();
            }
         };
         bc._onResult([args]);
      });
   });
});
