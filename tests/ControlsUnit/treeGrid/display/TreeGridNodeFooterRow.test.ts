import { RecordSet } from 'Types/collection';
import { TreeGridCollection } from 'Controls/treeGrid';
import { assert } from 'chai';
import { CssClassesAssert } from 'ControlsUnit/CustomAsserts';
import TreeGridNodeFooterRow from 'Controls/_treeGrid/display/TreeGridNodeFooterRow';

describe('Controls/_treeGrid/display/TreeGridNodeFooterRow', () => {
   const recordSet = new RecordSet({
      rawData: [{
         id: 1,
         parent: null,
         node: true,
         hasChildren: true
      }, {
         id: 2,
         parent: 1,
         node: false,
         hasChildren: false
      }, {
         id: 3,
         parent: 2,
         node: false,
         hasChildren: false
      }, {
         id: 4,
         parent: 2,
         node: null,
         hasChildren: false
      }, {
         id: 5,
         parent: 1,
         node: null,
         hasChildren: false
      }, {
         id: 6,
         parent: null,
         node: true,
         hasChildren: false
      }, {
         id: 7,
         parent: null,
         node: null,
         hasChildren: false
      }],
      keyProperty: 'id'
   });

   const getCollection = (options = {}) => {
      return new TreeGridCollection({
         collection: recordSet,
         root: null,
         keyProperty: 'id',
         parentProperty: 'parent',
         nodeProperty: 'node',
         hasChildrenProperty: 'hasChildren',
         columns: [{
            displayProperty: 'title',
            width: '300px',
            template: 'wml!template1'
         },
            {
               displayProperty: 'taxBase',
               width: '200px',
               template: 'wml!template1'
            }
         ],
         expandedItems: [null],
         nodeFooterTemplate: () => '',
         ...options
      });
   };

   let treeGridCollection;
   let nodeFooterRow;

   beforeEach(() => {
      treeGridCollection = getCollection();

      nodeFooterRow = treeGridCollection.at(3) as TreeGridNodeFooterRow;
   });

   it('.getColumns()', () => {
      let columns = nodeFooterRow.getColumns();
      assert.equal(columns.length, 1);

      treeGridCollection.setMultiSelectVisibility('visible');
      columns = nodeFooterRow.getColumns();
      assert.equal(columns.length, 2);
   });

   it('.getItemClasses()', () => {
      CssClassesAssert.isSame(nodeFooterRow.getItemClasses(), 'controls-ListView__itemV controls-Grid__row controls-TreeGrid__nodeFooter');
   });

   it('.getExpanderPaddingClasses()', () => {
      CssClassesAssert.isSame(nodeFooterRow.getExpanderPaddingClasses(), 'controls-TreeGrid__node-extraItem-expanderPadding controls-TreeGrid__row-expanderPadding_size_default js-controls-ListView__notEditable');
      CssClassesAssert.isSame(nodeFooterRow.getExpanderPaddingClasses('s'), 'controls-TreeGrid__node-extraItem-expanderPadding controls-TreeGrid__row-expanderPadding_size_s js-controls-ListView__notEditable');
   });

   it('.shouldDisplayExtraItem()', () => {
      assert.isFalse(nodeFooterRow.shouldDisplayExtraItem(undefined));
      assert.isTrue(nodeFooterRow.shouldDisplayExtraItem({}));

      treeGridCollection.setHasMoreStorage({
         3: { forward: true, backward: false }
      });
      assert.isTrue(nodeFooterRow.shouldDisplayExtraItem(undefined));
   });
});
