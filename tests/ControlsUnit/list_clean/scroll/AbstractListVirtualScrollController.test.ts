import { assert } from 'chai';
import { spy } from 'sinon';

import {ListVirtualScrollController} from 'Controls/_baseList/Controllers/ListVirtualScrollController';
import {IAbstractListVirtualScrollControllerOptions as ControllerOptions} from 'Controls/_baseList/Controllers/AbstractListVirtualScrollController';
import { Collection } from 'Controls/display';
import {RecordSet} from 'Types/collection';

function getDefaultControllerOptions(): ControllerOptions {
    return {
        itemsContainer: null,
        listContainer: null,
        listControl: null,
        collection: null,
        itemsContainerUniqueSelector: '',
        itemsQuerySelector: '',
        triggersQuerySelector: '',
        triggersPositions: {backward: 'offset', forward: 'offset'},
        triggersVisibility: {backward: true, forward: true},
        triggersOffsetCoefficients: {backward: 0, forward: 0},
        additionalTriggersOffsets: {backward: 0, forward: 0},
        virtualScrollConfig: {},
        activeElementKey: null,
        scrollToElementUtil: (container, position, force) => null,
        doScrollUtil: (scrollParam) => null,
        updatePlaceholdersUtil: (placeholders) => null,
        updateShadowsUtil: (hasItems) => null,
        updateVirtualNavigationUtil: (hasItems) => null,
        activeElementChangedCallback: (activeElementIndex) => null,
        hasItemsOutRangeChangedCallback: (hasItems) => null,
        itemsEndedCallback: (direction) => null
    };
}

function getController(options: Partial<ControllerOptions>): ListVirtualScrollController {
    return new ListVirtualScrollController({
            ...getDefaultControllerOptions(),
            ...options
    });
}

function getCollection(items: []): Collection {
    return new Collection({
        collection: new RecordSet({
            rawData: items,
            keyProperty: 'key'
        }),
        keyProperty: 'key'
    });
}

describe('Controls/_baseList/Controllers/AbstractListVirtualScrollController', () => {
    describe('set iterator to collection', () => {
        it('in constructor', () => {
            const collection = getCollection([]);
            const setIteratorSpy = spy(collection, 'setViewIterator');
            const controller = getController({collection});
            assert.isTrue(setIteratorSpy.calledOnce);
            assert.ok(controller);
        });

        it('after set collection', () => {
            const collection = getCollection([]);
            const controller = getController({collection});

            const newCollection = getCollection([]);
            const setIteratorSpy = spy(newCollection, 'setViewIterator');
            controller.setCollection(newCollection);
            assert.isTrue(setIteratorSpy.calledOnce);
        });
    });
});
