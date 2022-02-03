import jsdom = require('jsdom');
import { assert } from 'chai';
import { spy } from 'sinon';

import {ListVirtualScrollController} from 'Controls/_baseList/Controllers/ListVirtualScrollController';
import {IAbstractListVirtualScrollControllerOptions as ControllerOptions} from 'Controls/_baseList/Controllers/AbstractListVirtualScrollController';
import {getCollection, getItemsContainer, ItemsContainerUniqueClass, ItemClass, TriggerClass} from './initUtils';

function getDefaultControllerOptions(): ControllerOptions {
    return {
        itemsContainer: null,
        listContainer: null,
        listControl: null,
        collection: null,
        itemsContainerUniqueSelector: `.${ItemsContainerUniqueClass}`,
        itemsQuerySelector: `.${ItemClass}`,
        triggersQuerySelector: `.${TriggerClass}`,
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

describe('Controls/_baseList/Controllers/AbstractListVirtualScrollController', () => {
    before(() => {
        window = new jsdom.JSDOM('').window;
        window.requestAnimationFrame = (callback: Function) => callback();
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
            const collection = getCollection([{key: 1}, {key: 2}]);
            const itemsContainer = getItemsContainer(collection);
            const scrollToElementUtil = spy(() => null);
            const controller = getController({
                collection,
                scrollToElementUtil,
                itemsContainer,
                activeElementKey: 2
            });
            controller.afterMountListControl();
            assert.isFalse(scrollToElementUtil.calledOnce);
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
            controller.afterRenderListControl();
            assert.isTrue(scrollToElementUtil.calledOnce);
        });
    });

    describe('scroll to item', () => {
        it('scroll after render new indexes', () => {
            const collection = getCollection([{key: 1}]);
            const itemsContainer = getItemsContainer(collection);
            const scrollToElementUtil = spy(() => null);
            const controller = getController({
                collection,
                scrollToElementUtil,
                itemsContainer
            });
            controller.resetItems();
            controller.scrollToItem(1);
            controller.afterRenderListControl();
            assert.isTrue(scrollToElementUtil.calledOnce);
        });
    });
});
