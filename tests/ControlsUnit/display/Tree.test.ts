import { assert } from 'chai';
import { assert as sinonAssert, spy } from 'sinon';

import {
    NodeFooter,
    Tree,
    TreeItem
} from 'Controls/display';

import {
    List,
    ObservableList,
    IObservable as IBindCollectionDisplay,
    RecordSet
} from 'Types/collection';

import { Model } from 'Types/entity';

import {Serializer} from 'UI/State';
import TreeGridCollection from 'Controls/_treeGrid/display/TreeGridCollection';
import {TreeGridDataRow, TreeGridNodeFooterRow} from 'Controls/treeGrid';

interface IData {
    id: number;
    pid?: number;
    node?: boolean;
    title?: string;
}

describe('Controls/_display/Tree', () => {
    function getData(): IData[] {
        /*
            0 - root
                1
                    10
                    11
                    12
                        121
                        122
                        123
                2
                    20
                        200
                            2000
                3
                4
        */

         return [{
             id: 10,
             pid: 1,
             node: true,
             title: 'AA'
         }, {
             id: 11,
             pid: 1,
             node: true,
             title: 'AB'
         }, {
             id: 12,
             pid: 1,
             node: true,
             title: 'AC'
         }, {
             id: 121,
             pid: 12,
             node: true,
             title: 'ACA'
         }, {
             id: 122,
             pid: 12,
             node: false,
             title: 'ACB'
         }, {
             id: 123,
             pid: 12,
             node: false,
             title: 'ACC'
         }, {
             id: 1,
             pid: 0,
             node: true,
             title: 'A'
         }, {
             id: 2,
             pid: 0,
             node: true,
             title: 'B'
         }, {
             id: 20,
             pid: 2,
             node: true,
             title: 'BA'
         }, {
             id: 200,
             pid: 20,
             node: true,
             title: 'BAA'
         }, {
             id: 2000,
             pid: 200,
             title: 'BAAA'
         }, {
             id: 3,
             pid: 0,
             node: false,
             title: 'C'
         }, {
             id: 4,
             pid: 0,
             title: 'D'
         }];
     }

    function getItems(): List<IData> {
        return new List({
            items: getData()
        });
    }

    function getObservableItems(): ObservableList<IData> {
        return new ObservableList({
            items: getData()
        });
    }

    function getTree(items: List<IData>, options: object = {}): Tree<IData> {
        return new Tree({
            collection: items || getItems(),
            root: {
                id: 0,
                title: 'Root'
            },
            keyProperty: 'id',
            parentProperty: 'pid',
            nodeProperty: 'node',
            hasChildrenProperty: 'hasChildren',
            ...options
        });
    }

    function getObservableTree<T = ObservableList<IData>>(items?: any): Tree<T> {
        return new Tree({
            collection: items || getObservableItems(),
            root: {
                id: 0,
                title: 'Root'
            },
            keyProperty: 'id',
            parentProperty: 'pid',
            nodeProperty: 'node',
            hasChildrenProperty: 'hasChildren'
        });
    }

    function getRecordSetTree(): Tree<Model> {
        const rs = new RecordSet({
            rawData: getData(),
            keyProperty: 'id'
        });
        return getObservableTree<Model>(rs);
    }

    let items: List<IData>;
    let tree: Tree<IData>;

    beforeEach(() => {
        items = getItems();
        tree = getTree(items);
    });

    afterEach(() => {
        tree.destroy();
        tree = undefined;
        items = undefined;
    });

    describe('.getEnumerator()', () => {
        it('should traverse items in hierarchical order use AdjacencyList strategy', () => {
            const enumerator = tree.getEnumerator();
            const expect = ['A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
            let index = 0;

            while (enumerator.moveNext()) {
                const item = enumerator.getCurrent();
                assert.strictEqual(item.getContents().title, expect[index]);
                index++;
            }
        });

        it('should traverse items in hierarchical order use MaterializedPath strategy', () => {
            const items = [
                {id: 1, children: [
                        {id: 11, children: []},
                        {id: 12, children: [
                                {id: 121, children: []},
                                {id: 122}
                            ]},
                        {id: 13, children: []}
                    ]},
                {id: 2, children: [
                        {id: 21},
                        {id: 22}
                    ]}
            ];
            const tree = new Tree({
                collection: items,
                root: {
                    id: 0,
                    title: 'Root'
                },
                childrenProperty: 'children'
            });
            const enumerator = tree.getEnumerator();
            const expect = [1, 11, 12, 121, 122, 13, 2, 21, 22];
            let index = 0;

            while (enumerator.moveNext()) {
                const item = enumerator.getCurrent();
                assert.strictEqual(item.getContents().id, expect[index]);
                index++;
            }
        });

        it('should traverse all items', () => {
            const enumerator = tree.getEnumerator();
            let index = 0;
            while (enumerator.moveNext()) {
                index++;
            }
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index);
        });

        it('should traverse all items as flat list if no options specified', () => {
            const tree = new Tree({
                collection: items
            });
            const enumerator = tree.getEnumerator();
            let index = 0;
            while (enumerator.moveNext()) {
                const item = enumerator.getCurrent();
                assert.strictEqual(item.getContents(), items.at(index));
                index++;
            }
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index);
        });

        it('should traverse root if "rootEnumerable" option is true', () => {
            const tree = new Tree({
                collection: items,
                root: {
                    id: 0,
                    title: 'Root'
                },
                rootEnumerable: true,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const enumerator = tree.getEnumerator();
            const expect = ['Root', 'A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
            let index = 0;
            while (enumerator.moveNext()) {
                const item = enumerator.getCurrent();
                assert.strictEqual(item.getContents().title, expect[index]);
                index++;
            }
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index - 1);
        });
    });

    describe('.each()', () => {
        it('should update the display after move grouped item out of the root', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, pid: 1, group: 'a'},
                    {id: 2, pid: 1, group: 'a'},
                    {id: 3, pid: 1, group: 'a'}
                ]
            });
            const tree = new Tree({
                collection: rs,
                root: 1,
                keyProperty: 'id',
                parentProperty: 'pid',
                hasChildrenProperty: 'hasChildren',
                group: (item) => item.get('group')
            });
            const model = rs.at(1);
            const expectedBefore = ['a', rs.at(0), rs.at(1), rs.at(2)];
            const expectedAfter = ['a', rs.at(0), rs.at(2)];

            tree.each((item, i) => {
                assert.equal(expectedBefore[i], item.getContents());
            });

            model.set('pid', 0);
            tree.each((item, i) => {
                assert.equal(expectedAfter[i], item.getContents());
            });
        });
    });

    describe('.getItemBySourceItem()', () => {
        it('should return projection item if it collection item have been changed', () => {
            const tree = getRecordSetTree();
            const collection = tree.getCollection() as any as RecordSet;
            const item = collection.getRecordById(10);

            tree.setFilter((collItem) => (collItem.get('pid') === 0) ? true : false);
            item.set('pid', 0);
            assert.isDefined(tree.getItemBySourceItem(item));
        });
    });

    describe('.getParentProperty()', () => {
        it('should return given value', () => {
            assert.equal(tree.getParentProperty(), 'pid');
        });
    });

    describe('.setParentProperty()', () => {
        it('should change the value', () => {
            tree.setParentProperty('uid');
            assert.equal(tree.getParentProperty(), 'uid');
        });

        it('should bring all items to the root', () => {
            tree.setRoot(null);
            tree.setParentProperty('');
            let count = 0;
            tree.each((item) => {
                assert.equal(item.getContents(), items.at(count));
                count++;

            });
            assert.strictEqual(count, items.getCount());
            assert.strictEqual(tree.getCount(), items.getCount());
        });
    });

    describe('.getNodeProperty(), .setNodeProperty()', () => {
        it('should return given value', () => {
            assert.equal(tree.getNodeProperty(), 'node');
            tree.setNodeProperty('nodeProperty');
            assert.equal(tree.getNodeProperty(), 'nodeProperty');
        });
    });

    describe('.getChildrenProperty(), .setChildrenProperty()', () => {
        it('should return given value', () => {
            assert.strictEqual(tree.getChildrenProperty(), '');
            tree.setChildrenProperty('childrenProperty');
            assert.strictEqual(tree.getChildrenProperty(), 'childrenProperty');
        });
    });

    describe('.getRoot()', () => {
        it('should return given root from a number', () => {
            const tree = new Tree({
                collection: items,
                root: 0,
                keyProperty: 'id'
            });
            assert.strictEqual(tree.getRoot().getContents(), 0 as any);
        });

        it('should return given root from a string', () => {
            const tree = new Tree({
                collection: items,
                root: '',
                keyProperty: 'id'
            });
            assert.strictEqual(tree.getRoot().getContents(), '' as any);
        });

        it('should return given root from an object', () => {
            const tree = new Tree({
                collection: items,
                root: {id: 1, title: 'Root'},
                keyProperty: 'id'
            });
            assert.strictEqual(tree.getRoot().getContents().id, 1);
            assert.strictEqual(tree.getRoot().getContents().title, 'Root');
        });

        it('should return given root from a TreeItem', () => {
            const root = new TreeItem({contents: {
                id: null,
                title: 'Root'
            }});
            const tree = new Tree({
                collection: items,
                root,
                keyProperty: 'id'
            });
            assert.strictEqual(tree.getRoot(), root);
        });

        it('should return a valid enumerable root if it have children without link by contents', () => {
            const tree = new Tree({
                collection: items,
                root: null,
                rootEnumerable: true,
                keyProperty: 'id'
            });
            const root = tree.getRoot();

            assert.isNull(root.getContents());
            assert.isTrue(root.isRoot());
            assert.isUndefined(root.getParent());
        });

        it('should return a root without trigger property change event', () => {
            const tree = new Tree({
                collection: items,
                root: 0,
                keyProperty: 'id'
            });

            let triggered = false;
            const handler = () => {
                triggered = true;
            };

            tree.subscribe('onCollectionChange', handler);
            tree.getRoot();
            tree.unsubscribe('onCollectionChange', handler);

            assert.isFalse(triggered);
        });
    });

    describe('.setRoot()', () => {
        it('should set root as scalar', () => {
            tree.setRoot(1);
            assert.strictEqual(tree.getRoot().getContents() as any, 1);
        });

        it('should set root as object', () => {
            const root = {id: 1};
            tree.setRoot(root);
            assert.strictEqual(tree.getRoot().getContents(), root);
        });

        it('should set root as tree item', () => {
            const root = new TreeItem({contents: {
                    id: null,
                    title: 'Root'
                }});
            tree.setRoot(root);
            assert.strictEqual(tree.getRoot(), root);
        });

        it('should update count', () => {
            assert.notEqual(tree.getCount(), 6);
            tree.setRoot(1);
            assert.strictEqual(tree.getCount(), 6);
        });

        it('should change items and then the revert it back', () => {
            const before = [];
            tree.each((item) => {
                before.push(item.getContents());
            });
            assert.notEqual(before.length, 6);

            // Change items
            tree.setRoot(1);
            const after = [];
            tree.each((item) => {
                after.push(item.getContents());
            });
            assert.strictEqual(after.length, 6);

            // Revert back
            tree.setRoot(0);
            const revert = [];
            tree.each((item) => {
                revert.push(item.getContents());
            });
            assert.deepEqual(revert, before);
        });

        it('should set root if grouping has used', () => {
            const items = [
                {id: 1, pid: 0, g: 0},
                {id: 2, pid: 0, g: 1},
                {id: 11, pid: 1, g: 0}
            ];
            const list = new List({
                items
            });
            const tree = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                group: (item) => item.g
            });

            tree.setRoot(1);
            assert.strictEqual(tree.getCount(), 2);
        });
    });

    describe('.isRootEnumerable()', () => {
        it('should return false by default', () => {
            assert.isFalse(tree.isRootEnumerable());
        });
    });

    describe('.setRootEnumerable()', () => {
        it('should change root to enumerable', () => {
            tree.setRootEnumerable(true);
            assert.isTrue(tree.isRootEnumerable());
        });

        it('should not change root to enumerable', () => {
            tree.setRootEnumerable(false);
            assert.isFalse(tree.isRootEnumerable());
        });

        it('should traverse root after change to true', () => {
            tree.setRootEnumerable(true);

            const expect = ['Root', 'A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
            let index = 0;
            tree.each((item) => {
                assert.strictEqual(item.getContents().title, expect[index]);
                index++;
            });
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index - 1);
        });

        it('should not traverse root after change to false', () => {
            tree.setRootEnumerable(true);
            tree.setRootEnumerable(false);

            const expect = ['A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
            let index = 0;
            tree.each((item) => {
                assert.strictEqual(item.getContents().title, expect[index]);
                index++;
            });
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index);
        });
    });

    describe('.getRootLevel()', () => {
        it('should return 0 if root is not enumerable', () => {
            const collection = new List();
            const tree = new Tree({
                collection,
                rootEnumerable: false
            });
            assert.strictEqual(tree.getRootLevel(), 0);
        });

        it('should return 1 if root is enumerable', () => {
            const collection = new List();
            const tree = new Tree({
                collection,
                rootEnumerable: true
            });
            assert.strictEqual(tree.getRootLevel(), 1);
        });
    });

    describe('.getChildren()', () => {
        it('should return children of a root', () => {
            const children = tree.getChildren(tree.getRoot());
            const expect = ['A', 'B', 'C', 'D'];

            assert.equal(children.getCount(), expect.length);
            children.each((child, index) => {
                assert.strictEqual(child.getContents().title, expect[index]);
            });
        });

        it('should return children of the first node', () => {
            const children = tree.getChildren(tree.at(0));
            const expect = ['AA', 'AB', 'AC'];

            assert.equal(children.getCount(), expect.length);
            children.each((child, index) => {
                assert.strictEqual(child.getContents().title, expect[index]);
            });
        });

        it('should return children hidden by the filter', () => {
            const expect = ['AA', 'AB', 'AC'];

            tree.setFilter((item) => item.title !== 'AB');

            assert.equal(
                tree.getChildren(tree.at(0), true).getCount(),
                expect.length - 1
            );

            const children = tree.getChildren(tree.at(0), false);

            assert.equal(
                children.getCount(),
                expect.length
            );
            children.each((child, index) => {
                assert.strictEqual(child.getContents().title, expect[index]);
            });
        });

        it('should throw an error for invalid node', () => {
            assert.throws(() => {
                tree.getChildren(undefined);
            });
            assert.throws(() => {
                tree.getChildren({} as any);
            });
        });
    });

    describe('.getItemUid()', () => {
        it('should return path from item to the root', () => {
            const data = [
                {id: 1, pid: 0},
                {id: 2, pid: 1},
                {id: 3, pid: 2}
            ];
            const items = new List({
                items: data
            });
            const tree = getTree(items);
            const expect = ['1', '2:1', '3:2:1'];

            let index = 0;
            tree.each((item) => {
                assert.strictEqual(tree.getItemUid(item), expect[index]);
                index++;
            });
            assert.equal(index, expect.length);
        });

        it('should return path for items with duplicated ids', () => {
            const data = [
                {id: 1, pid: 0},
                {id: 2, pid: 1},
                {id: 3, pid: 2},
                {id: 2, pid: 1}
            ];
            const items = new List({
                items: data
            });
            const tree = getTree(items);
            const expect = ['1', '2:1', '3:2:1', '2:1-1', '3:2:1-1'];

            let index = 0;
            tree.each((item) => {
                assert.strictEqual(tree.getItemUid(item), expect[index]);
                index++;
            });
            assert.equal(index, expect.length);
        });

        it('should mind not only TreeItems in path to root', () => {
            const tree = getTree(new List());
            const parent: any = {
                getContents: () => {
                    return {id: 1};
                }
            };
            const item = new TreeItem({
                contents: {id: 2},
                parent
            });

            assert.strictEqual(tree.getItemUid(item), '2');
        });
    });

    describe('.getIndexBySourceItem()', () => {
        it('should return 0 for root contents if root is enumerable', () => {
            const tree = new Tree({
                collection: items,
                root: items[1],
                rootEnumerable: true,
                keyProperty: 'id'
            });

            assert.strictEqual(tree.getIndexBySourceItem(items[1]), 0);
        });
    });

    describe('.getIndexBySourceIndex()', () => {
        it('should return valid tree index if root is enumerable', () => {
            tree.setRootEnumerable(true);
            for (let i = 0; i < items.getCount(); i++) {
                const index = tree.getIndexBySourceIndex(i);
                assert.strictEqual(
                    items.at(i),
                    tree.at(index).getContents()
                );
            }
        });
    });

    describe('.getSourceIndexByIndex()', () => {
        it('should return valid source collection index if root is enumerable', () => {
            tree.setRootEnumerable(true);
            for (let i = 0; i < tree.getCount(); i++) {
                const index = tree.getSourceIndexByIndex(i);
                if (index === -1) {
                    assert.strictEqual(
                        tree.at(i),
                        tree.getRoot()
                    );
                } else {
                    assert.strictEqual(
                        tree.at(i).getContents(),
                        items.at(index)
                    );
                }
            }
        });
    });

    describe('.getNext()', () => {
        it('should return next item', () => {
            const item = tree.getNext(tree.at(0));
            assert.equal(item.getContents().id, 2);
        });

        it('should skip groups', () => {
            const items = [
                {id: 1, pid: 0, g: 0},
                {id: 2, pid: 0, g: 1},
                {id: 11, pid: 1, g: 0},
                {id: 12, pid: 1, g: 0},
                {id: 22, pid: 2, g: 2}
            ];
            const list = new List({
                items
            });
            const display = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                group: (item) => item.g
            });

            let item = display.at(1); // id = 1
            assert.strictEqual(display.getNext(item).getContents().id, 2);

            item = display.at(2); // id = 11
            assert.strictEqual(display.getNext(item).getContents().id, 12);
        });

        it('should not fail when collection is empty', () => {
            const list = new List();
            const display = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid'
            });
            assert.strictEqual(display.getNext(display.at(0)), undefined);
        });
    });

    describe('.getPrevious()', () => {
        it('should return previous item', () => {
            const item = tree.getPrevious(tree.at(2));
            assert.equal(item.getContents().id, 10);
        });

        it('should skip groups', () => {
            const items = [
                {id: 1, pid: 0, g: 0},
                {id: 2, pid: 0, g: 1},
                {id: 11, pid: 1, g: 0},
                {id: 12, pid: 1, g: 0},
                {id: 22, pid: 2, g: 2}
            ];
            const list = new List({
                items
            });
            const display = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                group: (item) => item.g
            });

            let item = display.at(5); // id = 2
            assert.strictEqual(display.getPrevious(item).getContents().id, 1);

            item = display.at(1); // id = 1
            assert.isUndefined(display.getPrevious(item));
        });
    });

    describe('.setSort', () => {
        it('should sort put folders before leafs', () => {
            const items = [
                {id: 1, pid: 0, node: false},
                {id: 2, pid: 0, node: false},
                {id: 3, pid: 0, node: true},
                {id: 4, pid: 0, node: true}
            ];
            const collection = new List({
                items
            });
            const display = new Tree({
                collection,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const exected = [
                items[2],
                items[3],
                items[0],
                items[1]
            ];
            const given = [];

            display.setSort((a, b) => {
                const isNodeA = a.item.isNode();
                const isNodeB = b.item.isNode();
                if (isNodeA === isNodeB) {
                    return 0;
                } else {
                    return isNodeA ? -1 : 1;
                }
            });

            display.each((item) => {
                given.push(item.getContents());
            });

            assert.deepEqual(given, exected);
        });
    });

    describe('.setGroup()', () => {
        it('should place nodes before leafs', () => {
            const items = [
                {id: 1, node: false, group: 'a'},
                {id: 2, node: false, group: 'b'},
                {id: 3, node: true, group: 'a'},
                {id: 4, node: true, group: 'b'},
                {id: 5, node: false, group: 'a'}
            ];
            const list = new List({
                items
            });
            const display = new Tree({
                collection: list,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const expected = [
                'a',
                items[0],
                items[2],
                items[4],
                'b',
                items[1],
                items[3]
            ];
            const given = [];

            display.setGroup((item) => item.group);
            display.each((item) => {
                given.push(item.getContents());
            });

            assert.deepEqual(given, expected);
        });

        it('should place groups inside nodes', () => {
            const items = [
                {id: 1, pid: 0, node: true, group: 'a'},
                {id: 2, pid: 0, node: true, group: 'a'},
                {id: 3, pid: 0, node: false, group: 'a'},
                {id: 11, pid: 1, node: false, group: 'b'},
                {id: 12, pid: 1, node: false, group: 'b'},
                {id: 13, pid: 1, node: false, group: 'c'}
            ];
            const list = new List({
                items
            });
            const display = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const expectedA = [
                items[0],
                items[3],
                items[4],
                items[5],
                items[1],
                items[2]
            ];
            const givenA = [];

            display.each((item) => {
                givenA.push(item.getContents());
            });
            assert.deepEqual(givenA, expectedA);

            display.setGroup((item) => item.group);
            const expectedB = [
                'a',
                items[0],
                'b',
                items[3],
                items[4],
                'c',
                items[5],
                'a',
                items[1],
                items[2]
            ];
            const givenB = [];
            display.each((item) => {
                givenB.push(item.getContents());
            });
            assert.deepEqual(givenB, expectedB);
        });

        it('should leave groups inside nodes after add items', () => {
            const items = [
                {id: 1, pid: 0, node: true, group: 'a'},
                {id: 2, pid: 0, node: false, group: 'b'}
            ];
            const addItems = [
                {id: 11, pid: 1, node: false, group: 'c'}
            ];
            const list = new ObservableList({
                items
            });
            const display = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node',
                group: (item) => item.group
            });
            const expected = [
                'a',
                items[0],
                'c',
                addItems[0],
                'b',
                items[1]
            ];
            const given = [];

            list.append(addItems);
            display.each((item) => {
                given.push(item.getContents());
            });
            assert.deepEqual(given, expected);
        });
    });

    describe('.setEventRaising()', () => {
        it('should save expanded when unfreeze collection', () => {
            const tree = getObservableTree();
            const item = tree.getNext(tree.at(0));

            item.setExpanded(true);
            (tree.getCollection() as any).setEventRaising(false);
            (tree.getCollection() as any).setEventRaising(true);
            assert.isTrue(item.isExpanded());
        });
    });

    describe('.subscribe()', () => {
        const getCollectionChangeHandler = (given, itemsMapper?) => {
            return (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems: itemsMapper ? newItems.map(itemsMapper) : newItems,
                    newItemsIndex,
                    oldItems: itemsMapper ? oldItems.map(itemsMapper) : oldItems,
                    oldItemsIndex
                });
            };
        };

        context('onCollectionChange', () => {
            it('should fire with all of children if add a node', () => {
                const tree = getObservableTree();
                const list = tree.getCollection() as ObservableList<IData>;
                const newItems = [
                    {id: 51,  pid: 5,  title: 'EA'},
                    {id: 52,  pid: 5,  title: 'EB'},
                    {id: 521, pid: 52, title: 'EBA'},
                    {id: 53,  pid: 5,  title: 'EC'}
                ];
                const newNode = {id: 5, pid: 0, title: 'E'};
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: ['E', 'EA', 'EB', 'EBA', 'EC'],
                    newItemsIndex: list.getCount(),
                    oldItems: [],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().title);

                tree.subscribe('onCollectionChange', handler);
                list.append(newItems);
                list.add(newNode);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with all of children after remove a node', () => {
                const tree = getObservableTree();
                const firstNodeItemIndex = 6;
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: ['A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC'],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().title);

                tree.subscribe('onCollectionChange', handler);
                (tree.getCollection() as ObservableList<IData>).removeAt(firstNodeItemIndex);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with only removed node if filter used', () => {
                const data = [
                    {id: 1, pid: 0},
                    {id: 11, pid: 1},
                    {id: 2, pid: 0},
                    {id: 3, pid: 0}
                ];
                const list = new ObservableList({
                    items: data
                });
                const tree = new Tree({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    filter: (item) => item.pid === 0
                });
                const given = [];
                const handler = getCollectionChangeHandler(given);

                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [tree.at(0)],
                    oldItemsIndex: 0
                }];

                tree.subscribe('onCollectionChange', handler);
                list.removeAt(0);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on move a node down', () => {
                const items = [
                    {id: 1, pid: 0},
                    {id: 2, pid: 0},
                    {id: 3, pid: 0}
                ];
                const list = new ObservableList({
                    items
                });
                const tree = new Tree({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                const moveFrom = 1;
                const moveTo = 2;
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_MOVE,
                    newItems: [items[moveTo]],
                    newItemsIndex: moveFrom,
                    oldItems: [items[moveTo]],
                    oldItemsIndex: moveTo
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents());

                tree.subscribe('onCollectionChange', handler);
                list.move(moveFrom, moveTo);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on move a node up', () => {
                const items = [
                    {id: 1, pid: 0},
                    {id: 2, pid: 0},
                    {id: 3, pid: 0}
                ];
                const list = new ObservableList({
                    items
                });
                const tree = new Tree({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                const moveFrom = 2;
                const moveTo = 0;
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_MOVE,
                    newItems: [items[moveFrom]],
                    newItemsIndex: moveTo,
                    oldItems: [items[moveFrom]],
                    oldItemsIndex: moveFrom
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents());

                tree.subscribe('onCollectionChange', handler);
                list.move(moveFrom, moveTo);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('shouldn\'t fire on move a node in sorted tree', () => {
                const sort = (a, b) => {
                    const isNodeA = a.item.isNode();
                    const isNodeB = b.item.isNode();
                    if (isNodeA === isNodeB) {
                        return a.index > b.index ? 1 : -1;
                    } else {
                        return isNodeA ? -1 : 1;
                    }
                };
                const list = new ObservableList({
                    items: [
                        {id: 1, pid: 0, node: true},
                        {id: 2, pid: 0, node: true},
                        {id: 3, pid: 0, node: false},
                        {id: 4, pid: 1, node: false},
                        {id: 5, pid: 1, node: false},
                        {id: 6, pid: 0, node: true}
                    ]
                });
                const tree = new Tree({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    nodeProperty: 'node',
                    sort
                });
                const moveFrom = 5;
                const moveTo = 2;
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents());

                tree.subscribe('onCollectionChange', handler);
                list.move(moveFrom, moveTo);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, []);
            });

            it('should fire after call setRootEnumerable with change to true', () => {
                const given = [];
                const handler = getCollectionChangeHandler(given);

                tree.subscribe('onCollectionChange', handler);
                tree.setRootEnumerable(true);
                tree.unsubscribe('onCollectionChange', handler);

                const expected = [{
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: [tree.at(0)],
                    newItemsIndex: 0,
                    oldItems: [],
                    oldItemsIndex: 0
                }];

                assert.deepEqual(given, expected);
            });

            it('should fire after call setRootEnumerable with change to false', () => {
                const given = [];
                const handler = getCollectionChangeHandler(given);

                tree.setRootEnumerable(true);
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [tree.at(0)],
                    oldItemsIndex: 0
                }];

                tree.subscribe('onCollectionChange', handler);
                tree.setRootEnumerable(false);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with valid newItemsIndex if root is enumerable', () => {
                const tree = getObservableTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const newItem = {id: 999, pid: 0, title: 'New'};
                const index = 1;

                // Add newItem into root will affect: add newItem, change root
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: [999],
                    newItemsIndex: 1,
                    oldItems: [],
                    oldItemsIndex: 0
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: [0],
                    newItemsIndex: 0,
                    oldItems: [0],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().id);

                tree.at(0);
                tree.setRootEnumerable(true);
                tree.subscribe('onCollectionChange', handler);
                collection.add(newItem, index);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with valid oldItemsIndex if root is enumerable', () => {
                const tree = getObservableTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const index = 1;
                const item = collection.at(index);

                // Remove AB from A will affect: remove AB, change A
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [item.title],
                    oldItemsIndex: 3
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['A'],
                    newItemsIndex: 1,
                    oldItems: ['A'],
                    oldItemsIndex: 1
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().title);

                tree.setRootEnumerable(true);
                tree.subscribe('onCollectionChange', handler);
                collection.removeAt(index);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with updated hierarchy level', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const index = collection.getIndexByValue('id', 4);
                const item = collection.at(index);
                const treeItem = tree.getItemBySourceItem(item);
                const oldLevel = treeItem.getLevel();

                let level;
                tree.subscribe('onCollectionChange', (e, action, newItems) => {
                    if (action === 'm' && newItems[0].getContents() === item) {
                        level = newItems[0].getLevel();
                    }
                });
                item.set('pid', 1);
                assert.strictEqual(oldLevel + 1, level);
            });

            it('should fire with updated hierarchy level if grouped', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const index = collection.getIndexByValue('id', 4);
                const item = collection.at(index);
                const treeItem = tree.getItemBySourceItem(item);
                const oldLevel = treeItem.getLevel();

                tree.setGroup(() => {
                    return 'foo';
                });

                let level;
                tree.subscribe('onCollectionChange', (e, action, newItems) => {
                    if (action === 'm' && newItems[0].getContents() === item) {
                        level = newItems[0].getLevel();
                    }
                });

                item.set('pid', 1);
                assert.strictEqual(oldLevel + 1, level);
            });

            it('should fire with an item that changed the level with the parent', () => {
                const rawData = [
                    {id: 1, pid: 0},
                    {id: 11, pid: 1},
                    {id: 111, pid: 11},
                    {id: 1111, pid: 111}
                ];
                const items = new RecordSet({
                    rawData
                });
                const tree = new Tree({
                    collection: items,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: [1, 11, 111, 1111],
                    newItemsIndex: 0,
                    oldItems: [1, 11, 111, 1111],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().get('id'));
                const record = items.at(2);

                tree.subscribe('onCollectionChange', handler);
                record.set('pid', 1);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on changed node if item has been moved to one', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const positionD = collection.getIndexByValue('title', 'D');
                const itemD = collection.at(positionD);

                // Move D into AC will affect: move D, change AC
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_MOVE,
                    newItems: [itemD.get('title')],
                    newItemsIndex: 7,
                    oldItems: [itemD.get('title')],
                    oldItemsIndex: 12
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['AC'],
                    newItemsIndex: 3,
                    oldItems: ['AC'],
                    oldItemsIndex: 3
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().get('title'));

                tree.subscribe('onCollectionChange', handler);
                itemD.set('pid', 12); // Root -> AC
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on changed node if it\'s item has been moved to another node', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as any as RecordSet;
                const item = collection.getRecordById(200);

                // Move BAA into AC will affect: move BAA, move BAAA, change BAA, change AC, change BA
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_MOVE,
                    newItems: ['BAA', 'BAAA'],
                    newItemsIndex: 7,
                    oldItems: ['BAA', 'BAAA'],
                    oldItemsIndex: 9
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['AC'],
                    newItemsIndex: 3,
                    oldItems: ['AC'],
                    oldItemsIndex: 3
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['BA'],
                    newItemsIndex: 10,
                    oldItems: ['BA'],
                    oldItemsIndex: 10
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().get('title'));

                tree.subscribe('onCollectionChange', handler);
                item.set('pid', 12);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on parent node if item has been added to it but filtered', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as any as RecordSet;
                const itemId = 2000;
                const parentId = 1;
                const item = collection.getRecordById(itemId);

                // Add BAAA (2000) into A (1) as hidden will affect: change A
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['A'],
                    newItemsIndex: 0,
                    oldItems: ['A'],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().get('title'));

                collection.remove(item);
                tree.setFilter((item) => item.get('pid') !== parentId);
                tree.subscribe('onCollectionChange', handler);
                item.set('pid', parentId);
                collection.add(item);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with inherited "expanded" property after replace an item', () => {
                const tree = getObservableTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const itemIndex = 1;
                const item = tree.at(itemIndex);
                const sourceIndex = collection.getIndex(item.getContents());
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [true],
                    oldItemsIndex: 1
                }, {
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: [true],
                    newItemsIndex: 1,
                    oldItems: [],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.isExpanded());

                const newItem = Object.create(item.getContents());
                item.setExpanded(true);

                tree.subscribe('onCollectionChange', handler);
                collection.replace(newItem, sourceIndex);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should dont with inherited "expanded" property after replace an item which no longer presented ' +
                'in the tree', () => {
                const tree = getObservableTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const itemIndex = 1;
                const item = tree.at(itemIndex);
                const sourceIndex = collection.getIndex(item.getContents());
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [true],
                    oldItemsIndex: 1
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: [false],
                    newItemsIndex: 0,
                    oldItems: [false],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.isExpanded());

                const newItem = Object.create(item.getContents());
                newItem.pid = -1;
                item.setExpanded(true);

                tree.subscribe('onCollectionChange', handler);
                collection.replace(newItem, sourceIndex);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire after remove-collapse-add-expand a node if filter used', () => {
                const items = [
                    {id: 'a', pid: null},
                    {id: 'b', pid: null},
                    {id: 'c', pid: 'a'}
                ];
                const list = new ObservableList({
                    items
                });
                let hidden = [];
                const tree = new Tree({
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    root: null,
                    collection: list,
                    filter: (item) => hidden.indexOf(item.id) === -1
                });
                const expected = [];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().id);

                const nodeA = tree.at(0);
                nodeA.setExpanded(true);

                tree.subscribe('onCollectionChange', handler);

                const removedItem = nodeA.getContents();
                list.remove(removedItem);
                expected.push({
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: ['a', 'c'],
                    oldItemsIndex: 0
                });

                hidden = ['c'];
                nodeA.setExpanded(false);
                expected.push({
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['a'],
                    newItemsIndex: -1,
                    oldItems: ['a'],
                    oldItemsIndex: -1
                });

                list.add(removedItem);
                const nodeB = tree.at(1);
                expected.push({
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: ['a'],
                    newItemsIndex: 1,
                    oldItems: [],
                    oldItemsIndex: 0
                });

                hidden = [];
                nodeB.setExpanded(true);
                expected.push({
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: ['c'],
                    newItemsIndex: 2,
                    oldItems: [],
                    oldItemsIndex: 0
                });
                expected.push({
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['a'],
                    newItemsIndex: 1,
                    oldItems: ['a'],
                    oldItemsIndex: 1
                });

                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });
        });
    });

    describe('.toJSON()', () => {
        it('should clone the tree', () => {
            const serializer = new Serializer();
            const json = JSON.stringify(tree, serializer.serialize);
            const clone = JSON.parse(json, serializer.deserialize);
            const items = tree.getItems();
            const cloneItems = clone.getItems();

            for (let i = 0; i < items.length; i++) {
                assert.strictEqual(
                    items[i].getInstanceId(),
                    cloneItems[i].getInstanceId(),
                    'at ' + i
                );

                const parent = items[i].getParent();
                const cloneParent = cloneItems[i].getParent();
                assert.strictEqual(
                    parent.getInstanceId(),
                    cloneParent.getInstanceId(),
                    'at parent for ' + i
                );
            }
        });
    });

    describe('expandable/collapsed', () => {
        let rsTree;

        beforeEach(() => {
            rsTree = getRecordSetTree();
        });

        it('setExpandedItems', () => {
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
            const expandedItems = [1];
            rsTree.setExpandedItems(expandedItems);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
            assert.notEqual(rsTree.getExpandedItems(), expandedItems);
        });

        it('setExpandedItems with same expanded items', () => {
            rsTree.setExpandedItems([1]);
            const currentVersion = rsTree.getVersion();
            rsTree.setExpandedItems([1]);
            assert.equal(currentVersion, rsTree.getVersion());
        });

        it('setExpandedItems with removed null', () => {
            rsTree.setExpandedItems([null]);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());

            rsTree.setExpandedItems([]);
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
        });

        xit('setExpandedItems collapse childs', () => {
            rsTree.setExpandedItems([1]);
            rsTree.getItemBySourceKey(11).setExpanded(true);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
            assert.isTrue(rsTree.getItemBySourceKey(11).isExpanded());
            rsTree.setExpandedItems([]);
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
            assert.isFalse(rsTree.getItemBySourceKey(11).isExpanded());
            rsTree.setExpandedItems([1]);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
            assert.isFalse(rsTree.getItemBySourceKey(11).isExpanded());
        });

        it('setCollapsedItems', () => {
            rsTree.setExpandedItems([1]);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
            const collapsedItems = [1];
            rsTree.setCollapsedItems(collapsedItems);
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
            assert.notEqual(rsTree.getCollapsedItems(), collapsedItems);

            const currentVersion = rsTree.getVersion();
            rsTree.setCollapsedItems(collapsedItems);
            assert.equal(currentVersion, rsTree.getVersion());
        });

        it('setCollapsedItems with same expanded items', () => {
            rsTree.setCollapsedItems([1]);
            const currentVersion = rsTree.getVersion();
            rsTree.setCollapsedItems([1]);
            assert.equal(currentVersion, rsTree.getVersion());
        });

        it('empty model', () => {
            const rs = new RecordSet({
                rawData: [],
                keyProperty: 'id'
            });
            const tree = getObservableTree<Model>(rs);

            tree.setExpandedItems([1, 2, 3]);
            assert.deepEqual(tree.getExpandedItems(), [1, 2, 3]);

            tree.setCollapsedItems([1, 2, 3]);
            assert.deepEqual(tree.getCollapsedItems(), [1, 2, 3]);
        });

        it('not collapse item when expand all items', () => {
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
            rsTree.setExpandedItems([1]);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());

            rsTree.setExpandedItems([null]);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
        });

        describe('create item with right expanded state', () => {
            it('all expandable', () => {
                rsTree.setExpandedItems([null]);
                const contents = new Model({
                    rawData: {
                        id: 123456
                    },
                    keyProperty: 'id'
                });
                const newItem = rsTree.createItem({contents});
                assert.isTrue(newItem.isExpanded());
            });

            it('all expandable, but one is collapsed', () => {
                rsTree.setExpandedItems([null]);
                rsTree.setCollapsedItems([123456]);
                const contents = new Model({
                    rawData: {
                        id: 123456
                    },
                    keyProperty: 'id'
                });
                const newItem = rsTree.createItem({contents});
                assert.isFalse(newItem.isExpanded());
            });

            it('one expanded', () => {
                rsTree.setExpandedItems([123456]);
                const contents = new Model({
                    rawData: {
                        id: 123456
                    },
                    keyProperty: 'id'
                });
                const newItem = rsTree.createItem({contents});
                assert.isTrue(newItem.isExpanded());
            });
        });

        describe('on collection changes', () => {
            const createRecordSet = () => {
                return new RecordSet({
                    rawData: [
                        {id: 1, node: true, pid: 0},
                        {id: 2, node: true, pid: 1},
                        {id: 3, node: null, pid: 1},
                        {id: 4, node: null, pid: 2},
                        {id: 5, node: null, pid: 0}
                    ],
                    keyProperty: 'id'
                });
            };

            let rs;

            describe('add', () => {
                beforeEach(() => {
                    rs = createRecordSet();
                });

                it('expandedItems is [null]', () => {
                    const tree = getTree(rs, {expandedItems: [null]});
                    rs.add(new Model({rawData: {id: 6, node: true, pid: 0}, keyProperty: 'id'}));
                    assert.isTrue(tree.getItemBySourceKey(6).isExpanded());
                });

                it('expandedItems is [null], collapsedItems is [6]', () => {
                    const tree = getTree(rs, {expandedItems: [null], collapsedItems: [6]});
                    rs.add(new Model({rawData: {id: 6, node: true, pid: 0}, keyProperty: 'id'}));
                    assert.isFalse(tree.getItemBySourceKey(6).isExpanded());
                });

                it('expandedItems is [1, 2]', () => {
                    const tree = getTree(rs, {expandedItems: [1, 2]});
                    rs.add(new Model({rawData: {id: 6, node: true, pid: 0}, keyProperty: 'id'}));
                    assert.isFalse(tree.getItemBySourceKey(6).isExpanded());
                });

                it('expandedItems is [1, 2, 6]', () => {
                    const tree = getTree(rs, {expandedItems: [1, 2, 6]});
                    rs.add(new Model({rawData: {id: 6, node: true, pid: 0}, keyProperty: 'id'}));
                    assert.isTrue(tree.getItemBySourceKey(6).isExpanded());
                });
            });

            describe('reset', () => {
                beforeEach(() => {
                    rs = createRecordSet();
                });

                it('expandedItems is [null]', () => {
                    const tree = getTree(rs, {expandedItems: [null]});
                    rs.assign(createRecordSet());
                    assert.isTrue(tree.getItemBySourceKey(1).isExpanded());
                    assert.isTrue(tree.getItemBySourceKey(2).isExpanded());
                });

                it('expandedItems is [null], collapsedItems is [2]', () => {
                    const tree = getTree(rs, {expandedItems: [null], collapsedItems: [2]});
                    rs.assign(createRecordSet());
                    assert.isTrue(tree.getItemBySourceKey(1).isExpanded());
                    assert.isFalse(tree.getItemBySourceKey(2).isExpanded());
                });

                it('expandedItems is [1, 2]', () => {
                    const tree = getTree(rs, {expandedItems: [1, 2]});
                    rs.assign(createRecordSet());
                    assert.isTrue(tree.getItemBySourceKey(1).isExpanded());
                    assert.isTrue(tree.getItemBySourceKey(2).isExpanded());
                });
            });

            describe('move', () => {
                beforeEach(() => {
                    rs = createRecordSet();
                });

                it('expandedItems is [null]', () => {
                    const tree = getTree(rs, {expandedItems: [null]});
                    rs.move(1, 4);
                    assert.isTrue(tree.getItemBySourceKey(1).isExpanded());
                    assert.isTrue(tree.getItemBySourceKey(2).isExpanded());
                });

                it('expandedItems is [null], collapsedItems is [2]', () => {
                    const tree = getTree(rs, {expandedItems: [null], collapsedItems: [2]});
                    rs.move(1, 4);
                    assert.isTrue(tree.getItemBySourceKey(1).isExpanded());
                    assert.isFalse(tree.getItemBySourceKey(2).isExpanded());
                });

                it('expandedItems is [1, 2]', () => {
                    const tree = getTree(rs, {expandedItems: [1, 2]});
                    rs.move(1, 4);
                    assert.isTrue(tree.getItemBySourceKey(1).isExpanded());
                    assert.isTrue(tree.getItemBySourceKey(2).isExpanded());
                });
            });
        });
    });

    describe('hasNodeWithChildren', () => {
       describe('hidden nodes', () => {
           it('has node with children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
               assert.isTrue(tree.hasNodeWithChildren());
           });

           it('not has node with children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
               assert.isFalse(tree.hasNodeWithChildren());
           });

           it('after reset should right recount state', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
               assert.isTrue(tree.hasNodeWithChildren());

               rs.assign(new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               }));
               assert.isFalse(tree.hasNodeWithChildren());

               rs.assign(new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               }));
               assert.isTrue(tree.hasNodeWithChildren());
           });
        });
       describe('default nodes', () => {
           it('has node with children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: true, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
               assert.isTrue(tree.hasNodeWithChildren());
           });

           it('not has node with children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: true, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
               assert.isFalse(tree.hasNodeWithChildren());
           });
        });

       it('recount when changed hasChildren in record', () => {
           const rs = new RecordSet({
               rawData: [
                   {id: 1, hasChildren: false, node: true, pid: 0}
               ],
               keyProperty: 'id'
           });
           const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
           assert.isFalse(tree.hasNodeWithChildren());
           rs.at(0).set('hasChildren', true);
           assert.isTrue(tree.hasNodeWithChildren());
       });

       it('recount when changed parent in record and not has hasChildrenProperty', () => {
           const rs = new RecordSet({
               rawData: [
                   {id: 1, node: true, pid: 0},
                   {id: 2, node: false, pid: 0}
               ],
               keyProperty: 'id'
           });
           const tree = getTree(rs, {expanderVisibility: 'hasChildren', hasChildrenProperty: ''});
           assert.isFalse(tree.hasNodeWithChildren());
           rs.getRecordById(2).set('pid', 1);
           assert.isTrue(tree.hasNodeWithChildren());
       });

       it('recount by add item in place', () => {
           const rs = new RecordSet({
               rawData: [
                   {id: 1, node: true, pid: 0}
               ],
               keyProperty: 'id'
           });
           const tree = getTree(rs, {expanderVisibility: 'hasChildren', hasChildrenProperty: ''});
           assert.isFalse(tree.hasNodeWithChildren());

           const contents = new Model({ rawData: {id: 11, node: null, pid: 1} });
           const addingItem = tree.createItem({ contents, isAdd: true });
           addingItem.setEditing(true, contents, false);
           tree.setAddingItem(addingItem, {position: 'bottom'});
           assert.isTrue(tree.hasNodeWithChildren());

           tree.resetAddingItem();
           assert.isFalse(tree.hasNodeWithChildren());
       });
    });

    describe('hasChildren', () => {
       describe('by option', () => {
           it('has children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs);
               assert.isTrue(tree.at(0).hasChildren());
               assert.isFalse(tree.at(0).hasChildrenByRecordSet());
           });

           it('not has children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs);
               assert.isFalse(tree.at(0).hasChildren());
               assert.isFalse(tree.at(0).hasChildrenByRecordSet());
           });
        });

       describe('by recordset', () => {
           it('has children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0},
                       {id: 2, hasChildren: true, node: false, pid: 1}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {hasChildrenProperty: ''});
               assert.isTrue(tree.at(0).hasChildren());
               assert.isTrue(tree.at(0).hasChildrenByRecordSet());
           });

           it('not has children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {hasChildrenProperty: ''});
               assert.isTrue(tree.at(0).hasChildren());
               assert.isFalse(tree.at(0).hasChildrenByRecordSet());
           });
        });

       describe('hasChildrenProperty is priority', () => {
           it('has children by recordset, but not has by property', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: false, pid: 0},
                       {id: 2, hasChildren: false, node: false, pid: 1}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs);
               assert.isFalse(tree.at(0).hasChildren());
               assert.isTrue(tree.at(0).hasChildrenByRecordSet());
           });

           it('not has children by recordset, but has by property', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs);
               assert.isTrue(tree.at(0).hasChildren());
               assert.isFalse(tree.at(0).hasChildrenByRecordSet());
           });
       });

       describe('recount hasChildrenByRecordSet', () => {
            it('recount by add', () => {
                const rs = new RecordSet({
                    rawData: [
                        {id: 1, hasChildren: false, node: true, pid: 0},
                        {id: 2, hasChildren: false, node: false, pid: 0}
                    ],
                    keyProperty: 'id'
                });
                const tree = getTree(rs, {hasChildrenProperty: '', expanderVisibility: 'hasChildren'});
                assert.isFalse(tree.at(0).hasChildrenByRecordSet());

                rs.add(new Model({
                    rawData: {id: 3, hasChildren: false, node: false, pid: 1},
                    keyProperty: 'id'
                }));

                assert.isTrue(tree.at(0).hasChildrenByRecordSet());
            });

            it('recount by change parent property', () => {
                const rs = new RecordSet({
                    rawData: [
                        {id: 1, hasChildren: false, node: true, pid: 0},
                        {id: 2, hasChildren: false, node: false, pid: 0}
                    ],
                    keyProperty: 'id'
                });
                const tree = getTree(rs, {hasChildrenProperty: '', expanderVisibility: 'hasChildren'});
                assert.isFalse(tree.at(0).hasChildrenByRecordSet());

                const record = rs.getRecordById(2);
                record.set('pid', 1);

                assert.isTrue(tree.at(0).hasChildrenByRecordSet());
            });

            it('expander padding, when node hidden by group', () => {
                const rs = new RecordSet({
                    rawData: [
                        {id: 1, hasChildren: true, node: true, pid: 0, group: 'group-1'},
                        {id: 11, hasChildren: false, node: null, pid: 1, group: 'group-1'},
                        {id: 2, hasChildren: false, node: true, pid: 0, group: 'group-2'}
                    ],
                    keyProperty: 'id'
                });
                let tree = getTree(rs, {groupProperty: 'group', expanderVisibility: 'hasChildren', collapsedGroups: ['group-1']});
                let item = tree.getItemBySourceKey(2);
                assert.isTrue(item.shouldDisplayExpanderPadding());

                tree = getTree(rs, {
                    hasChildrenProperty: '',
                    groupProperty: 'group',
                    expanderVisibility: 'hasChildren',
                    collapsedGroups: ['group-1']
                });
                item = tree.getItemBySourceKey(2);
                assert.isTrue(item.shouldDisplayExpanderPadding());
            });

            it('add list with childs and then make it is node', () => {
                const rs = new RecordSet({
                    rawData: [
                        {id: 1, hasChildren: false, node: true, pid: 0}
                    ],
                    keyProperty: 'id'
                });
                const tree = getTree(rs, {hasChildrenProperty: '', expanderVisibility: 'hasChildren'});
                assert.isFalse(tree.at(0).hasChildrenByRecordSet());

                rs.add(new Model({
                    rawData: {id: 2, hasChildren: false, node: null, pid: 0},
                    keyProperty: 'id'
                }));
                rs.add(new Model({
                    rawData: {id: 21, hasChildren: false, node: null, pid: 2},
                    keyProperty: 'id'
                }));
                rs.getRecordById(2).set('node', true);

                assert.isTrue(tree.getItemBySourceKey(2).hasChildrenByRecordSet());
            });

            it('recount by add item in place', () => {
                const rs = new RecordSet({
                    rawData: [
                        {id: 1, hasChildren: false, node: true, pid: 0}
                    ],
                    keyProperty: 'id'
                });
                const tree = getTree(rs, {hasChildrenProperty: '', expanderVisibility: 'hasChildren'});
                assert.isFalse(tree.at(0).hasChildrenByRecordSet());

                const contents = new Model({ rawData: {id: 11, node: null, pid: 1} });
                const addingItem = tree.createItem({ contents, isAdd: true });
                addingItem.setEditing(true, contents, false);
                tree.setAddingItem(addingItem, {position: 'bottom'});

                assert.isTrue(tree.at(0).hasChildrenByRecordSet());

                tree.resetAddingItem();
                assert.isFalse(tree.at(0).hasChildrenByRecordSet());
            });
        });
    });

    describe('hasNode', () => {
        it('has node', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            assert.isTrue(tree.hasNode());
        });

        it('not has node', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: null, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            assert.isFalse(tree.hasNode());
        });

        it('recount on change node state', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: null, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            assert.isFalse(tree.hasNode());

            rs.at(0).set('node', true);
            assert.isTrue(tree.hasNode());
        });

        it('recount on add item', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: null, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            assert.isFalse(tree.hasNode());

            rs.add(new Model({
                rawData: {id: 2, hasChildren: false, node: true, pid: 0}
            }));
            assert.isTrue(tree.hasNode());
        });

        it('recount on remove item', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: null, pid: 0},
                    {id: 2, hasChildren: false, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            assert.isTrue(tree.hasNode());

            rs.removeAt(1);
            assert.isFalse(tree.hasNode());
        });

        it('recount on reset', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: null, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            assert.isFalse(tree.hasNode());

            rs.assign(new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0}
                ],
                keyProperty: 'id'
            }));
            assert.isTrue(tree.hasNode());
        });

        it('recount on change root', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0},
                    {id: 11, hasChildren: false, node: null, pid: 1}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            assert.isTrue(tree.hasNode());

            tree.setRoot(1);
            assert.isFalse(tree.hasNode());

            tree.setRoot(0);
            assert.isTrue(tree.hasNode());
        });

        it('recount when set new recordset', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: null, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            assert.isFalse(tree.hasNode());

            const newRs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            tree.setCollection(newRs);
            assert.isTrue(tree.hasNode());
        });

        it('recount on add item and not changed hasNode', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: null, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            const version = tree.getVersion();
            assert.isFalse(tree.hasNode());

            rs.add(new Model({
                rawData: {id: 2, hasChildren: false, node: null, pid: 0}
            }));
            assert.isFalse(tree.hasNode());
            assert.equal(tree.getVersion(), version + 1);
        });
    });

    describe('node footers', () => {
       it('change visibility callback', () => {
           const rs = new RecordSet({
               rawData: [
                   {id: 1, node: true, pid: 0},
                   {id: 2, node: true, pid: 0}
               ],
               keyProperty: 'id'
           });
           const callback = (item: Model) => true;
           const tree = new Tree({
               collection: rs,
               root: {
                   id: 0,
                   title: 'Root'
               },
               keyProperty: 'id',
               parentProperty: 'pid',
               nodeProperty: 'node',
               expandedItems: [null],
               nodeFooterTemplate: () => '',
               nodeFooterVisibilityCallback: callback
           });

           assert.equal(tree.getItems().length, 4);
           assert.instanceOf(tree.at(1), NodeFooter);
           assert.instanceOf(tree.at(3), NodeFooter);

           const newCallback = (item) => {
               if (item.getKey() === 1) {
                   return true;
               }
           };
           tree.setNodeFooterVisibilityCallback(newCallback);
           assert.equal(tree.getItems().length, 3);
           assert.instanceOf(tree.at(1), NodeFooter);
           assert.isNotOk(tree.at(3));
       });

       it('save new visibilityCallback, when start adding item', () => {
           const rs = new RecordSet({
               rawData: [
                   {id: 1, node: true, pid: 0},
                   {id: 2, node: true, pid: 0}
               ],
               keyProperty: 'id'
           });
           const tree = new Tree({
               collection: rs,
               root: {
                   id: 0,
                   title: 'Root'
               },
               keyProperty: 'id',
               parentProperty: 'pid',
               nodeProperty: 'node',
               expandedItems: [null],
               nodeFooterTemplate: () => '',
               nodeFooterVisibilityCallback: (item: Model) => true
           });

           const newCallback = (item) => {
               if (item.getKey() === 1) {
                   return true;
               }
           };
           tree.setNodeFooterVisibilityCallback(newCallback);

           const addingItem = tree.createItem({
               contents: new Model({
                   rawData: {id: 3, node: null, pid: 0},
                   keyProperty: 'id'
               })
           });
           tree.setAddingItem(addingItem, {
               position: 'top',
               index: 3
           });
           // 4 элемента - это 2 узла, 1 футер и добавленная запись
           assert.equal(tree.getItems().length, 4);
       });

       it('when toggle node, recount only one node footer', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, node: true, pid: 0},
                    {id: 11, node: true, pid: 1},
                    {id: 2, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            // TODO должно быть Tree, но нодФутеры пока что создаются только в treeGrid
            //  и фильтрация по expandedItems тоже только в триГрид
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
                expandedItems: [1, 2],
                nodeFooterTemplate: () => ''
            });

            const onCollectionChange = spy(() => {/* FIXME: sinon mock */});
            tree.subscribe('onCollectionChange', onCollectionChange);

            // вернули узел 1
            tree.setExpandedItems([2]);

            // Должно быть только 1 событие: дети и футер удалились
            assert.equal(onCollectionChange.args.length, 1);

            // берем аргументы события удаления узла
            let args = onCollectionChange.args[0] as Array<[]|string>;
            assert.equal(args[1], 'rm'); // проверяем action
            const removedItems = args[4];
            assert.equal(removedItems.length, 2); // удалилось 2 элемента: ребенок и футер
            assert.instanceOf(removedItems[0], TreeGridDataRow); // удалился ребенок
            assert.instanceOf(removedItems[1], TreeGridNodeFooterRow); // удалился футер

            onCollectionChange.resetHistory();
            // развернули узел 1
            tree.setExpandedItems([1, 2]);

            // Должно быть только 1 событие: дети и футер добавились
            assert.equal(onCollectionChange.args.length, 1);

            // берем аргументы события удаления узла
            args = onCollectionChange.args[0];
            assert.equal(args[1], 'a'); // проверяем action
            const addedItems = args[2];
            assert.equal(addedItems.length, 2); // добавилось 2 элемента: ребенок и футер
            assert.instanceOf(removedItems[0], TreeGridDataRow); // добавился ребенок
            assert.instanceOf(removedItems[1], TreeGridNodeFooterRow); // добавился футер
        });

       it('not create node footers, if not has more and nodeTemplate', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, node: true, pid: 0},
                    {id: 11, node: true, pid: 1},
                    {id: 2, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = new Tree({
                collection: rs,
                root: {
                    id: 0,
                    title: 'Root'
                },
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node',
                expandedItems: [1, 2]
            });

            const items = tree.getItems();
            const hasNodeFooter = items.find((it) => it['[Controls/display:NodeFooter]']);
            assert.isNotOk(hasNodeFooter);
        });

       it('create footers if set nodeFooterTemplate', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, node: true, pid: 0},
                    {id: 11, node: true, pid: 1},
                    {id: 2, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = new Tree({
                collection: rs,
                root: {
                    id: 0,
                    title: 'Root'
                },
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node',
                expandedItems: [1, 2]
            });

            let items = tree.getItems();
            let hasNodeFooter = !!items.find((it) => it['[Controls/display:NodeFooter]']);
            assert.isFalse(hasNodeFooter);

            tree.setNodeFooterTemplate(() => '');
            items = tree.getItems();
            hasNodeFooter = !!items.find((it) => it['[Controls/display:NodeFooter]']);
            assert.isTrue(hasNodeFooter);
        });

       it('rebuild all node footers when pass flag', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, node: true, pid: 0},
                    {id: 11, node: true, pid: 1},
                    {id: 2, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = new Tree({
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
            const hasNodeFooter = !!items.find((it) => it['[Controls/display:NodeFooter]']);
            assert.isFalse(hasNodeFooter);

            // футеры сразу пересчитываются, т.к. передали флаг
            tree.setHasMoreStorage({
                1: {
                    forward: true,
                    backward: false
                }}, true);

            items = tree.getItems();
            // проверяем что создался узел
            const nodeFooters = items.filter((it) => it['[Controls/display:NodeFooter]']);
            assert.equal(nodeFooters.length, 1);
            assert.equal(nodeFooters[0].getNode(), tree.getItemBySourceKey(1));
            assert.equal(tree.getItemBySourceKey(1).getNodeFooter(), nodeFooters[0]);
        });

       it('right link in node footer and node', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, node: true, pid: 0},
                    {id: 11, node: true, pid: 1},
                    {id: 2, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = new Tree({
                collection: rs,
                root: {
                    id: 0,
                    title: 'Root'
                },
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node',
                expandedItems: [1, 2],
                nodeFooterTemplate: () => ''
            });

            rs.replace(new Model({
                rawData: {id: 1, node: true, pid: 0},
                keyProperty: 'id'
            }), 0);

            const node = tree.getItemBySourceKey(1);
            const nodeFooter = tree.at(2);
            assert.equal(node, nodeFooter.getNode());
            assert.equal(node.getNodeFooter(), nodeFooter);
        });

       it('recount footers when changed hasMoreStorage', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, node: true, pid: 0},
                    {id: 11, node: true, pid: 1},
                    {id: 2, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = new Tree({
                collection: rs,
                root: {
                    id: 0,
                    title: 'Root'
                },
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node',
                expandedItems: [1, 2]
            });

            let items = tree.getItems();
            let hasNodeFooter = !!items.find((it) => it['[Controls/display:NodeFooter]']);
            assert.isFalse(hasNodeFooter);

            // hasMoreStorage пересчитывается только после подгрузки в узел, поэтому нодФутеры
            // пересчитаются только, когда добавятся новые элементы
            tree.setHasMoreStorage({
                1: {
                    forward: true,
                    backward: false
                }
            });
            rs.add(new Model({
                rawData: {id: 12, node: null, pid: 1}
            }));

            items = tree.getItems();
            // првоеряем что создался узел и только один для узла 1
            const nodeFooters = items.filter((it) => it['[Controls/display:NodeFooter]']);
            assert.equal(nodeFooters.length, 1);
            assert.equal(nodeFooters[0].getNode(), tree.getItemBySourceKey(1));
            assert.equal(tree.getItemBySourceKey(1).getNodeFooter(), nodeFooters[0]);

            // имитируем последнюю подгрузку в узел, футер должен удалиться
            tree.setHasMoreStorage({1: false});
            rs.add(new Model({
                rawData: {id: 13, node: null, pid: 1}
            }));

            items = tree.getItems();
            hasNodeFooter = !!items.find((it) => it['[Controls/display:NodeFooter]']);
            assert.isFalse(hasNodeFooter);
            const node = tree.getItemBySourceKey(1);
            assert.isNotOk(node.getNodeFooter()); // проверяем что ссылка на футер занулилась
        });
    });

    describe('displayExpanderPadding', () => {
        it('default', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);
            assert.isTrue(tree._displayExpanderPadding);
        });

        it('expander icon is none', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs, {expanderIcon: 'none'});
            assert.isFalse(tree._displayExpanderPadding);
        });

        it('custom expander position', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs, {expanderPosition: 'custom'});
            assert.isFalse(tree._displayExpanderPadding);
        });

        it('expander visibility is hasChildren', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs, {expanderVisibility: 'hasChildren', hasChildrenProperty: 'hasChildren'});
            assert.isFalse(tree._displayExpanderPadding);

            rs.at(0).set('hasChildren', true);

            assert.isTrue(tree._displayExpanderPadding);
        });

        it('update all items', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: null, pid: 0},
                    {id: 2, hasChildren: false, node: null, pid: 0}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);

            assert.equal(tree.getItemBySourceKey(1).getVersion(), 2);
            assert.equal(tree.getItemBySourceKey(2).getVersion(), 2);

            const newItem = new Model({
                rawData: {id: 3, hasChildren: false, node: true, pid: 0},
                keyProperty: 'id'
            });
            rs.add(newItem);

            assert.isTrue(tree.hasNode());
            assert.equal(tree.getItemBySourceKey(1).getVersion(), 3);
            assert.equal(tree.getItemBySourceKey(2).getVersion(), 4); // 4 - т.к. еще изменился lastItem
            assert.isTrue(tree.getItemBySourceKey(1).shouldDisplayExpanderPadding());
            assert.isTrue(tree.getItemBySourceKey(2).shouldDisplayExpanderPadding());
        });
    });

    describe('parent', () => {
        it('recount hierarchy on change parent value in record', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0},
                    {id: 11, hasChildren: false, node: true, pid: 1},
                    {id: 2, hasChildren: false, node: true, pid: 0},
                    {id: 21, hasChildren: false, node: true, pid: 2},
                    {id: 22, hasChildren: false, node: true, pid: 2}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);

            // переместили одну запись в соседний узел
            rs.getRecordById(21).set('pid', 1);
            assert.equal(tree.getItemBySourceKey(21).getParent().key, 1);

            // переместили 2 записи из разных узлов в корень
            rs.getRecordById(21).set('pid', 0);
            rs.getRecordById(22).set('pid', 0);
            assert.isTrue(tree.getItemBySourceKey(21).getParent().isRoot());
            assert.isTrue(tree.getItemBySourceKey(22).getParent().isRoot());
        });

        it('not throw error when changed parent value on root key', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0},
                    {id: 11, hasChildren: false, node: true, pid: 1},
                    {id: 2, hasChildren: false, node: true, pid: 0},
                    {id: 21, hasChildren: false, node: true, pid: 2},
                    {id: 22, hasChildren: false, node: true, pid: 2}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs);

            // переместили одну запись в корень
            rs.getRecordById(21).set('pid', 0);
            assert.deepEqual(tree.getItemBySourceKey(21).getParent().key, { id: 0, title: 'Root' });
        });

        it('not throw error when has group or when add item with not exists parent', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, hasChildren: false, node: true, pid: 0, group: 1},
                    {id: 2, hasChildren: false, node: true, pid: 0, group: 1}
                ],
                keyProperty: 'id'
            });
            const tree = getTree(rs, {groupProperty: 'group'});

            let newItem = new Model({
                rawData: {id: 3, hasChildren: false, node:  false, pid: null, group: 1},
                keyProperty: 'id'
            });
            assert.doesNotThrow(rs.add.bind(rs, newItem));
            newItem = rs.getRecordById(3);
            assert.doesNotThrow(newItem.set.bind(newItem, 'pid', 0));
            assert.isOk(tree.getItemBySourceKey(3));
        });
    });
});
