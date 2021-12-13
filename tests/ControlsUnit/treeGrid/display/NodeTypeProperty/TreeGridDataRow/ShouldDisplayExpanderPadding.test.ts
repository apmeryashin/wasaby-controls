import {assert} from 'chai';
import {Model} from 'Types/entity';
import {TreeItem} from 'Controls/display';
import {TreeGridCollection, TreeGridDataRow} from 'Controls/treeGrid';
import { RecordSet } from 'Types/collection';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridDataRow/ShouldDisplayExpanderPadding', () => {
    const owner = {
        getExpanderIcon: () => 'testIcon',
        getExpanderPosition: () => 'default',
        getExpanderSize: () => undefined,
        getExpanderVisibility: () => 'visible'
    } as undefined as TreeGridCollection<any>;

    const root = new TreeItem({
        contents: null,
        owner
    });

    it('should display expander padding for items inside groupNode by has node inside groupNode', () => {
        const collection = new TreeGridCollection({
            collection: new RecordSet({
                rawData: [
                    {
                        id: 1,
                        nodeType: 'group',
                        parent: null,
                        node: true,
                        hasChildren: true
                    }, {
                        id: 11,
                        nodeType: null,
                        parent: 1,
                        node: null,
                        hasChildren: true
                    }, {
                        id: 12,
                        nodeType: null,
                        parent: 1,
                        node: null,
                        hasChildren: true
                    }
                ],
                keyProperty: 'id'
            }),
            root: null,
            columns: [],
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'node',
            hasChildrenProperty: 'hasChildren',
            nodeTypeProperty: 'nodeType',
            expandedItems: [null]
        });

        assert.isFalse(collection.at(1).shouldDisplayExpanderPadding(null, null));
        assert.isFalse(collection.at(2).shouldDisplayExpanderPadding(null, null));

        collection.at(1).getContents().set('node', true);
        assert.isTrue(collection.at(2).shouldDisplayExpanderPadding(null, null));
    });

    it('should return true when direct parent is not TreeGridGroupDataRow', () => {
        const parent = new TreeGridDataRow({
            contents: new Model({
                rawData: {
                    id: 11,
                    nodeType: null,
                    parent: null,
                    node: true,
                    hasChildren: true
                },
                keyProperty: 'id'
            }),
            columns: [],
            parent: root,
            owner
        });
        const child = new TreeGridDataRow({
            contents: new Model({
                rawData: {
                    id: 111,
                    nodeType: null,
                    parent: 11,
                    node: true,
                    hasChildren: false
                },
                keyProperty: 'id'
            }),
            columns: [],
            parent,
            owner,
            displayExpanderPadding: true
        });
        assert.isTrue(child.shouldDisplayExpanderPadding(null, null));
    });
});
