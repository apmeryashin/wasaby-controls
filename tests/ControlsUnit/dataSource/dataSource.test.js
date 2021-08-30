/* global define, describe, it, assert */
define([
   'Controls/dataSource'
], function(dataSource) {
   describe('Controls/dataSource', function() {
      it('dataSource:error defined', function() {
         assert.isDefined(dataSource.error);
      });
   });
});
