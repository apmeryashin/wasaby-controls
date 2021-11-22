import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import * as sinon from 'sinon';
import { TreeGridCollection, TreeGridDataRow } from 'Controls/treeGrid';

const rawData = [
    {
        key: 1,
        col1: 'c1-1',
        col2: 'с2-1',
        parent: null,
        type: true,
        nodeType: 'group'
    },
    {
        key: 2,
        col1: 'c1-2',
        col2: 'с2-2',
        parent: 1,
        type: null,
        nodeType: null
    },
    {
        key: 3,
        col1: 'c1-3',
        col2: 'с2-3',
        parent: 1,
        type: null,
        nodeType: null
    },
    {
        key: 4,
        col1: 'c1-4',
        col2: 'с2-4',
        parent: 1,
        type: null,
        nodeType: null
    }
];
const columns = [
    { displayProperty: 'col1' },
    { displayProperty: 'col2' }
];

describe('Controls/treeGrid_clean/Display/StickyGroup/HasStickyGroup', () => {
    let collection: RecordSet;
    beforeEach(() => {
        collection = new RecordSet({
            rawData,
            keyProperty: 'key'
        });
    });

    afterEach(() => {
        collection = undefined;
    });

    it('Initialize with stickyHeader and groups', () => {
        const treeGridCollection = new TreeGridCollection({
            collection,
            parentProperty: 'parent',
            root: null,
            nodeProperty: 'type',
            nodeTypeProperty: 'nodeType',
            keyProperty: 'key',
            stickyHeader: true,
            columns
        });
        treeGridCollection.each((item) => {
            if (item.LadderSupport) {
                assert.isTrue(item.hasStickyGroup());
            }
        });
    });
    it('Initialize without stickyHeader and with groups', () => {
        const treeGridCollection = new TreeGridCollection({
            collection,
            parentProperty: 'parent',
            root: null,
            nodeProperty: 'type',
            nodeTypeProperty: 'nodeType',
            keyProperty: 'key',
            columns
        });
        treeGridCollection.each((item) => {
            if (item.LadderSupport) {
                assert.isNotTrue(item.hasStickyGroup());
            }
        });
    });
    it('Initialize with stickyHeader and without groups', () => {
        const treeGridCollection = new TreeGridCollection({
            collection,
            parentProperty: 'parent',
            root: null,
            nodeProperty: 'type',
            nodeTypeProperty: 'type',
            keyProperty: 'key',
            stickyHeader: true,
            columns
        });
        treeGridCollection.each((item) => {
            if (item.LadderSupport) {
                assert.isNotTrue(item.hasStickyGroup());
            }
        });
    });
    it('Initialize without stickyHeader and groups', () => {
        const treeGridCollection = new TreeGridCollection({
            collection,
            parentProperty: 'parent',
            root: null,
            nodeProperty: 'type',
            nodeTypeProperty: 'type',
            keyProperty: 'key',
            stickyHeader: true,
            columns
        });
        treeGridCollection.each((item) => {
            if (item.LadderSupport) {
                assert.isNotTrue(item.hasStickyGroup());
            }
        });
    });

    it('updateHasStickyGroup', () => {
        const treeGridCollection = new TreeGridCollection({
            collection,
            keyProperty: 'key',
            parentProperty: 'parent',
            root: null,
            nodeProperty: 'type',
            nodeTypeProperty: 'nodeType',
            keyProperty: 'key',
            stickyHeader: true,
            columns
        });

        assert.strictEqual(treeGridCollection.getVersion(), 4);

        const sandbox = sinon.createSandbox();
        treeGridCollection.getViewIterator().each((item: TreeGridDataRow<any>) => {
            if (item.LadderSupport) {
                sandbox.spy(item, 'setHasStickyGroup');
            }
        });

        treeGridCollection.setNodeTypeProperty('nodeType');

        assert.strictEqual(treeGridCollection.getVersion(), 5);
        treeGridCollection.getViewIterator().each((item: TreeGridDataRow<any>) => {
            if (item.LadderSupport) {
                assert(item.setHasStickyGroup.calledOnce, 'setHasStickyGroup must be called on items');
                assert.isTrue(item.setHasStickyGroup.getCall(0).args[0], 'setHasStickyGroup must be true');
            }
        });

        sandbox.restore();
    });
});
