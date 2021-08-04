import { assert } from 'chai';
import {GridGroupRow as GroupItem} from 'Controls/grid';

describe('Controls/_display/grid/GroupItem', () => {
   describe('isSticked', () => {
      it('sticky enabled', () => {
         const owner = { isStickyGroup: () => true, getGridColumnsConfig: () => [] };
         const item = new GroupItem({owner});
         assert.isTrue(item.isSticked());
      });

      it('sticky disabled', () => {
         const owner = { isStickyGroup: () => false, getGridColumnsConfig: () => [] };
         const item = new GroupItem({owner});
         assert.isFalse(item.isSticked());
      });

      it('hidden group', () => {
         const owner = { isStickyGroup: () => true, getGridColumnsConfig: () => [] };
         const item = new GroupItem({owner, contents: 'CONTROLS_HIDDEN_GROUP'});
         assert.isFalse(item.isSticked());
      });
   });
});
