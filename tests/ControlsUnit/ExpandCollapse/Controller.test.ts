import {assert} from 'chai';

import {groupConstants, Tree, TreeItem} from 'Controls/display';
import {ALL_EXPANDED_VALUE, ExpandController} from 'Controls/expandCollapse';
import { RecordSet } from 'Types/collection';
import {Model} from 'Types/entity';

function initTest(data: object[], options?: {}, collectionOptions?: {}): {recordSet: RecordSet, model: Tree, controller: ExpandController} {
    const recordSet = new RecordSet({
        rawData: data,
        keyProperty: 'id'
    });

    const model = new Tree({
        collection: recordSet,
        keyProperty: 'id',
        nodeProperty: 'node',
        parentProperty: 'parent',
        root: null,
        ...collectionOptions
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
    describe('updateOptions', () => {
        it('update model', () => {
            const data = [
                {id: 1, parent: null, node: true, group: groupConstants.hiddenGroup},
                {id: 2, parent: null, node: true, group: groupConstants.hiddenGroup},
                {id: 3, parent: null, node: true, group: groupConstants.hiddenGroup}
            ];
            const { controller } = initTest(
                data,
                {expandedItems: [1, 2, 3]},
                {nodeFooterTemplate: () => null, groupProperty: 'group'}
            );

            const {model} = initTest(data);
            controller.updateOptions({model});
            assert.isTrue(model.getItemBySourceKey(1).isExpanded());
            assert.isTrue(model.getItemBySourceKey(2).isExpanded());
            assert.isTrue(model.getItemBySourceKey(3).isExpanded());
        });
    });

    describe('setExpandedItems', () => {
        it('with node footers and groups', () => {
            const data = [
                {id: 1, parent: null, node: true, group: groupConstants.hiddenGroup},
                {id: 2, parent: null, node: true, group: groupConstants.hiddenGroup},
                {id: 3, parent: null, node: true, group: groupConstants.hiddenGroup}
            ];
            const {controller, model} = initTest(
                data,
                {expandedItems: [1, 2, 3]},
                {nodeFooterTemplate: () => null, groupProperty: 'group'}
            );
            controller.setExpandedItems([1, 2]);
            controller.applyStateToModel();
            assert.isTrue(model.getItemBySourceKey(1).isExpanded());
            assert.isTrue(model.getItemBySourceKey(2).isExpanded());
            assert.isFalse(model.getItemBySourceKey(3).isExpanded());
        });
    });

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
