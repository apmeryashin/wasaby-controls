define(
   [
      'Controls/Container/PendingRegistrator',
      'Core/Deferred'
   ],
   (PendingRegistrator, Deferred) => {
      'use strict';

      describe('Controls/Container/PendingRegistrator', () => {
         it('register/unregister pending', () => {
            let Registrator = new PendingRegistrator();
            let def1 = new Deferred();
            let def2 = new Deferred();
            let def3 = new Deferred();

            Registrator._beforeMount();
            Registrator._children = {
               loadingIndicator: {
                  show: () => 'id1',
                  hide: (id) => {
                     assert.equal(id, 'id1');
                  }
               }
            };
            Registrator._registerPendingHandler(null, def1, {});
            Registrator._registerPendingHandler(null, def2, { showLoadingIndicator: true });
            Registrator._registerPendingHandler(null, def3, {});

            assert.equal(Object.keys(Registrator._pendings).length, 3);

            def1.callback();
            def2.callback();
            def3.callback();

            assert.equal(Object.keys(Registrator._pendings).length, 0);

            Registrator.destroy();
         });
      });
   }
);
