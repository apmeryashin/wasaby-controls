import {RecordSet} from 'Types/collection';
import {assert} from 'chai';
import TreeGridCollection from 'Controls/_treeGrid/display/TreeGridCollection';

describe('Controls/treeGrid_clean/Display/NodeFooter/Collection', () => {
    it('rebuild all node footers when pass flag', () => {
        const rs = new RecordSet({
            rawData: [
                {id: 1, node: true, pid: 0},
                {id: 11, node: true, pid: 1},
                {id: 2, node: true, pid: 0}
            ],
            keyProperty: 'id'
        });
        const tree = new TreeGridCollection({
            collection: rs,
            root: {
                id: 0,
                title: 'Root'
            },
            keyProperty: 'id',
            parentProperty: 'pid',
            nodeProperty: 'node',
            columns: [],
            expandedItems: [1, 2]
        });

        let items = tree.getItems();
        const hasNodeFooter = !!items.find((it) => it['[Controls/treeGrid:TreeGridNodeFooterRow]']);
        assert.isFalse(hasNodeFooter);

        // футеры сразу пересчитываются, т.к. передали флаг
        tree.setHasMoreStorage({
            1: {
                forward: true,
                backward: false
            }
        }, true);

        items = tree.getItems();
        // проверяем что создался узел
        const nodeFooters = items.filter((it) => it['[Controls/treeGrid:TreeGridNodeFooterRow]']);
        assert.equal(nodeFooters.length, 1);
        assert.equal(nodeFooters[0].getNode(), tree.getItemBySourceKey(1));
        assert.equal(tree.getItemBySourceKey(1).getNodeFooter(), nodeFooters[0]);
    });
});
