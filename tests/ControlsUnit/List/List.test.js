define(['Controls/list'], function(lists) {
   describe('Controls.List', () => {
      it('reloadItem', function() {
         var list = new lists.View({});
         list._children = {
            listControl: {
               reloadItem: function(key, options) {
                  assert.equal(key, 'test');
                  assert.deepEqual(options.readMeta, {test: 'test'});
                  assert.equal(options.hierarchyReload, true);
               }
            }
         };
         list.reloadItem('test', {
            readMeta: { test: 'test' },
            hierarchyReload: true
         });
      });
   });
});
