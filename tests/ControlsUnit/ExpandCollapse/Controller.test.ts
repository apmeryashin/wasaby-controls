import {assert} from 'chai';

import { Tree, TreeItem } from 'Controls/display';
import {ALL_EXPANDED_VALUE, ExpandController} from 'Controls/expandCollapse';
import { RecordSet } from 'Types/collection';
import {Model} from 'Types/entity';

function initTest(data: object[], options?: {}): {recordSet: RecordSet, model: Tree, controller: ExpandController} {
    const recordSet = new RecordSet({
        rawData: data,
        keyProperty: 'id'
    });

    const model = new Tree({
        collection: recordSet,
        keyProperty: 'id',
        nodeProperty: 'node',
        parentProperty: 'parent',
        root: null
    });

    const controller = new ExpandController({
        singleExpand: false,
        expandedItems: [],
        collapsedItems: [],
        loader: null,
        model,
        ...options
    });

    return {recordSet, model, controller};
}

describe('ExpandCollapse/Controller', () => {
    describe('onCollectionRemove', () => {
        it('remove from expanded items removed item keys', () => {
            const data = [
                {id: 1, parent: null, node: true},
                {id: 2, parent: null, node: true},
                {id: 3, parent: null, node: true}
            ];
            const {controller, model, recordSet} = initTest(data, {expandedItems: [1, 2, 3]});
            const removedItems = [model.getItemBySourceKey(1), model.getItemBySourceKey(2)];
            recordSet.remove(recordSet.getRecordById(1));
            recordSet.remove(recordSet.getRecordById(2));
            const result = controller.onCollectionRemove(removedItems);
            assert.deepEqual(result, {expandedItems: [3]});
        });

        it('remove from collapsed items removed item keys', () => {
            const data = [
                {id: 1, parent: null, node: true},
                {id: 2, parent: null, node: true},
                {id: 3, parent: null, node: true}
            ];
            const {controller, model, recordSet} = initTest(data, {expandedItems: [ALL_EXPANDED_VALUE], collapsedItems: [1, 2]});
            const removedItems = [model.getItemBySourceKey(1), model.getItemBySourceKey(2)];
            recordSet.remove(recordSet.getRecordById(1));
            recordSet.remove(recordSet.getRecordById(2));
            const result = controller.onCollectionRemove(removedItems);
            assert.deepEqual(result, {collapsedItems: []});
        });

        it('not remove from expanded items ALL_EXPANDED_VALUE', () => {
            const data = [
                {id: 1, parent: null, node: true},
                {id: 2, parent: null, node: true},
                {id: 3, parent: null, node: true}
            ];
            const {controller, model} = initTest(data, {expandedItems: [ALL_EXPANDED_VALUE], collapsedItems: [1, 2]});
            const removedItem = new TreeItem({
                contents: new Model({
                    rawData: {id: null, parent: null, node: null},
                    keyProperty: 'id'
                }),
                owner: model
            });
            const result = controller.onCollectionRemove([removedItem]);
            assert.deepEqual(result, {});
        });
    });
});
