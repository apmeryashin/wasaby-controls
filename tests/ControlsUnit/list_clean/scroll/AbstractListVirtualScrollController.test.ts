import jsdom = require('jsdom');
import { assert } from 'chai';
import { spy } from 'sinon';

import {ListVirtualScrollController} from 'Controls/_baseList/Controllers/ListVirtualScrollController';
import {IAbstractListVirtualScrollControllerOptions as ControllerOptions} from 'Controls/_baseList/Controllers/AbstractListVirtualScrollController';
import { Collection } from 'Controls/display';
import {RecordSet} from 'Types/collection';

const ItemsContainerUniqueSelector = 'itemsContainer';
const ItemsQuerySelector = 'item';

function getDefaultControllerOptions(): ControllerOptions {
    return {
        itemsContainer: null,
        listContainer: null,
        listControl: null,
        collection: null,
        itemsContainerUniqueSelector: `.${ItemsContainerUniqueSelector}`,
        itemsQuerySelector: `.${ItemsQuerySelector}`,
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
        itemsEndedCallback: (direction) => null,
        feature1183225611: false
    };
}

function getController(options: Partial<ControllerOptions>): ListVirtualScrollController {
    return new ListVirtualScrollController({
            ...getDefaultControllerOptions(),
            ...options
    });
}

function getCollection(items: object[]): Collection {
    return new Collection({
        collection: new RecordSet({
            rawData: items,
            keyProperty: 'key'
        }),
        keyProperty: 'key'
    });
}

function getItemsContainer(collection: Collection): HTMLElement {
    const dom = new jsdom.JSDOM(`
        <!DOCTYPE html>
        <div class="${ItemsContainerUniqueSelector}"></div>
    `);

    const itemsContainer: HTMLElement = dom.window.document.querySelector('.itemsContainer');

    collection.each((item) => {
        const itemElement: HTMLElement = dom.window.document.createElement('div');

        itemElement.className = ItemsQuerySelector;
        itemElement.setAttribute('item-key', item.key);

        itemsContainer.appendChild(itemElement);
    });

    return itemsContainer;
}

describe('Controls/_baseList/Controllers/AbstractListVirtualScrollController', () => {
    before(() => {
        window = new jsdom.JSDOM('').window;
    });

    after(() => {
        window = {};
    });

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

    describe('scroll to active element', () => {
        it('after mount', () => {
            const collection = getCollection([{key: 1}]);
            const itemsContainer = getItemsContainer(collection);
            const scrollToElementUtil = spy(() => null);
            const controller = getController({
                collection,
                scrollToElementUtil,
                itemsContainer,
                activeElementKey: 1
            });
            controller.afterMountListControl();
            assert.isTrue(scrollToElementUtil.calledOnce);
        });

        it('on reset items', () => {
            const collection = getCollection([{key: 1}]);
            const itemsContainer = getItemsContainer(collection);
            const scrollToElementUtil = spy(() => null);
            const controller = getController({
                collection,
                scrollToElementUtil,
                itemsContainer,
                activeElementKey: 1
            });
            controller.resetItems();
            assert.isTrue(scrollToElementUtil.calledOnce);
        });
    });
});
