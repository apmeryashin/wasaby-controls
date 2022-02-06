import jsdom = require('jsdom');
import {assert} from 'chai';
import {createSandbox, SinonSpy, spy} from 'sinon';

import {
    IListVirtualScrollControllerOptions,
    ListVirtualScrollController
} from 'Controls/_baseList/Controllers/ListVirtualScrollController';
import {
    getCollection,
    getListControl,
    getScrollContainerWithList,
    renderCollectionChanges,
    ItemClass,
    ItemsContainerUniqueClass,
    ListContainerUniqueClass,
    TriggerClass
} from './initUtils';
import { Collection } from 'Controls/display';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

describe('Controls/_baseList/Controllers/AbstractListVirtualScrollController', () => {
    let sandbox;

    let collection: Collection;
    let controller: ListVirtualScrollController;
    let controllerParams: IListVirtualScrollControllerOptions;
    let itemsContainer: HTMLElement;

    let setIteratorSpy: SinonSpy;
    let scrollToElementUtilSpy: SinonSpy;
    let doScrollUtilSpy: SinonSpy;
    let updatePlaceholdersUtilSpy: SinonSpy;
    let updateShadowsUtilSpy: SinonSpy;
    let updateVirtualNavigationUtilSpy: SinonSpy;
    let activeElementChangedCallbackSpy: SinonSpy;
    let hasItemsOutRangeChangedCallbackSpy: SinonSpy;
    let itemsEndedCallbackSpy: SinonSpy;

    const resetHistoryCallbacks: Function = () => {
        setIteratorSpy?.resetHistory();
        scrollToElementUtilSpy?.resetHistory();
        doScrollUtilSpy?.resetHistory();
        updatePlaceholdersUtilSpy?.resetHistory();
        updateShadowsUtilSpy?.resetHistory();
        updateVirtualNavigationUtilSpy?.resetHistory();
        activeElementChangedCallbackSpy?.resetHistory();
        hasItemsOutRangeChangedCallbackSpy?.resetHistory();
        itemsEndedCallbackSpy?.resetHistory();
    };

    before(() => {
        window = new jsdom.JSDOM('').window;
        window.requestAnimationFrame = (callback: Function) => callback();

        sandbox = createSandbox();
    });

    after(() => {
        window = {};
    });

    beforeEach(() => {
        collection = getCollection([
            {key: 1, height: 50},
            {key: 2, height: 50},
            {key: 3, height: 50},
            {key: 4, height: 50},
            {key: 5, height: 50},
            {key: 6, height: 50},
            {key: 7, height: 50},
            {key: 8, height: 50},
            {key: 9, height: 50},
            {key: 10, height: 50}
        ]);
        setIteratorSpy = spy(collection, 'setViewIterator');

        scrollToElementUtilSpy = spy(() => null);
        doScrollUtilSpy = spy(() => null);
        updatePlaceholdersUtilSpy = spy(() => null);
        updateShadowsUtilSpy = spy(() => null);
        updateVirtualNavigationUtilSpy = spy(() => null);
        activeElementChangedCallbackSpy = spy(() => null);
        hasItemsOutRangeChangedCallbackSpy = spy(() => null);
        itemsEndedCallbackSpy = spy(() => null);

        controllerParams = {
            itemsContainer: null,
            listContainer: null,
            listControl: getListControl(),
            collection,
            itemsContainerUniqueSelector: `.${ItemsContainerUniqueClass}`,
            itemsQuerySelector: `.${ItemClass}`,
            triggersQuerySelector: `.${TriggerClass}`,
            triggersPositions: {backward: 'offset', forward: 'offset'},
            triggersVisibility: {backward: true, forward: true},
            triggersOffsetCoefficients: {backward: 0, forward: 0},
            additionalTriggersOffsets: {backward: 0, forward: 0},
            virtualScrollConfig: {
                pageSize: 5
            },
            activeElementKey: null,
            scrollToElementUtil: scrollToElementUtilSpy,
            doScrollUtil: doScrollUtilSpy,
            updatePlaceholdersUtil: updatePlaceholdersUtilSpy,
            updateShadowsUtil: updateShadowsUtilSpy,
            updateVirtualNavigationUtil: updateVirtualNavigationUtilSpy,
            activeElementChangedCallback: activeElementChangedCallbackSpy,
            hasItemsOutRangeChangedCallback: hasItemsOutRangeChangedCallbackSpy,
            itemsEndedCallback: itemsEndedCallbackSpy,
            feature1183225611: false,
            disableVirtualScroll: false,
            initialScrollPosition: null,
            multiColumns: false
        };
        controller = new ListVirtualScrollController(controllerParams);

        const scrollContainer = getScrollContainerWithList(collection);
        const listContainer = scrollContainer.querySelector(`.${ListContainerUniqueClass}`) as HTMLElement;
        itemsContainer = scrollContainer.querySelector(`.${ItemsContainerUniqueClass}`) as HTMLElement;
        controller.setListContainer(listContainer);
        controller.setItemsContainer(itemsContainer);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should set iterator to collection', () => {
            assert.isTrue(setIteratorSpy.called);
        });

        it('should set indexes to collection', () => {
            assert.equal(collection.getStartIndex(), 0);
            assert.equal(collection.getStopIndex(), 5);
        });
    });

    describe('endBeforeMountListControl', () => {
        it('should schedule setIndexes if has changes between beforeMount and afterMount', () => {
            controller.endBeforeMountListControl();
            controller.addItems(0, 2, 'unfixed', 'extend');
            assert.equal(collection.getStartIndex(), 0);
            assert.equal(collection.getStopIndex(), 5);
            controller.afterMountListControl();
            controller.beforeRenderListControl();
            controller.afterRenderListControl();
            assert.equal(collection.getStartIndex(), 0);
            assert.equal(collection.getStopIndex(), 7);
        });
    });

    describe('afterMountListControl', () => {
        it('should call update shadows util', () => {
            controller.afterMountListControl();

            assert.isTrue(hasItemsOutRangeChangedCallbackSpy.withArgs({backward: false, forward: true}).called);
            assert.isTrue(updateVirtualNavigationUtilSpy.withArgs({backward: false, forward: true}).called);
            assert.isTrue(updatePlaceholdersUtilSpy.withArgs({backward: 0, forward: 0}).called);
            assert.isTrue(updateShadowsUtilSpy.withArgs({backward: false, forward: true}).called);
            sandbox.assert.callOrder(
                hasItemsOutRangeChangedCallbackSpy,
                updateVirtualNavigationUtilSpy,
                updatePlaceholdersUtilSpy,
                updateShadowsUtilSpy
            );

            assert.isFalse(scrollToElementUtilSpy.called);
            assert.isFalse(doScrollUtilSpy.called);
            assert.isFalse(activeElementChangedCallbackSpy.called);
            assert.isFalse(itemsEndedCallbackSpy.called);
        });

        it('scroll to active element', () => {
            controller.setActiveElementKey(3);

            controller.afterMountListControl();

            const activeElement = itemsContainer.querySelector('div[item-key="3"]');
            assert.isTrue(scrollToElementUtilSpy.withArgs(activeElement, 'top', true).called);
            assert.isTrue(hasItemsOutRangeChangedCallbackSpy.withArgs({backward: false, forward: true}).called);
            assert.isTrue(updateVirtualNavigationUtilSpy.withArgs({backward: false, forward: true}).called);
            assert.isTrue(updatePlaceholdersUtilSpy.withArgs({backward: 0, forward: 0}).called);
            assert.isTrue(updateShadowsUtilSpy.withArgs({backward: false, forward: true}).called);
            sandbox.assert.callOrder(
                hasItemsOutRangeChangedCallbackSpy,
                updateVirtualNavigationUtilSpy,
                updatePlaceholdersUtilSpy,
                updateShadowsUtilSpy,
                scrollToElementUtilSpy
            );

            assert.isFalse(doScrollUtilSpy.called);
            assert.isFalse(activeElementChangedCallbackSpy.called);
            assert.isFalse(itemsEndedCallbackSpy.called);
        });

        it('not scroll to first active element', () => {
            controller.setActiveElementKey(1);
            controller.afterMountListControl();

            assert.isFalse(scrollToElementUtilSpy.called);
        });
    });

    describe('endBeforeUpdateListControl', () => {
        it('should schedule setIndexes if has changes between beforeUpdate and afterRender', () => {
            controller.endBeforeUpdateListControl();
            controller.addItems(0, 2, 'unfixed', 'extend');
            assert.equal(collection.getStartIndex(), 0);
            assert.equal(collection.getStopIndex(), 5);
            controller.afterRenderListControl();
            assert.equal(collection.getStartIndex(), 0);
            assert.equal(collection.getStopIndex(), 7);
        });
    });

    describe('beforeRenderListControl, afterRenderListControl => restore scroll', () => {
        it('should restore scroll position', () => {
            controller.afterMountListControl();
            controller.scrollPositionChange(0);
            controller.contentResized(250);
            controller.viewportResized(100);
            resetHistoryCallbacks();

            const recordSet = collection.getCollection() as unknown as RecordSet;
            recordSet.add(new Model({rawData: {key: -1, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: 0, height: 50}}), 0);

            controller.addItems(0, 2, 'fixed', 'shift');

            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            assert.isTrue(doScrollUtilSpy.withArgs(100).called);
            assert.isTrue(updatePlaceholdersUtilSpy.withArgs({backward: 0, forward: 100}).called);
            sandbox.assert.callOrder(
                updatePlaceholdersUtilSpy,
                doScrollUtilSpy
            );

            assert.isFalse(scrollToElementUtilSpy.called);
            assert.isFalse(activeElementChangedCallbackSpy.called);
            assert.isFalse(itemsEndedCallbackSpy.called);
            assert.isFalse(hasItemsOutRangeChangedCallbackSpy.called);
            assert.isFalse(updateVirtualNavigationUtilSpy.called);
            assert.isFalse(updateShadowsUtilSpy.called);
        });

        it('restore scroll when render item outside range or remove it', () => {
            controller.afterMountListControl();
            controller.scrollPositionChange(0);
            controller.contentResized(250);
            controller.viewportResized(100);

            const recordSet = collection.getCollection() as unknown as RecordSet;
            recordSet.add(new Model({rawData: {key: 0, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -1, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -2, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -3, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -4, height: 50}}), 0);
            controller.addItems(0, 5, 'fixed', 'shift');
            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();

            resetHistoryCallbacks();

            collection.at(0).setMarked(true);
            collection.at(0).setRenderedOutsideRange(true);

            // проверяем что сохранилась позиция скролла при отображении элемента за пределами диапазона
            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            assert.isTrue(doScrollUtilSpy.withArgs(50).called);
            assert.isFalse(scrollToElementUtilSpy.called);
            assert.isFalse(activeElementChangedCallbackSpy.called);
            assert.isFalse(itemsEndedCallbackSpy.called);
            assert.isFalse(hasItemsOutRangeChangedCallbackSpy.called);
            assert.isFalse(updateVirtualNavigationUtilSpy.called);
            assert.isFalse(updatePlaceholdersUtilSpy.called);
            assert.isFalse(updateShadowsUtilSpy.called);

            // проверяем что сохранилась позиция скролла при скрытии элемента за пределами диапазона
            collection.at(0).setMarked(false);
            collection.at(0).setRenderedOutsideRange(false);
            controller.scrollPositionChange(100);
            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            assert.isTrue(doScrollUtilSpy.withArgs(50).called);
            assert.isFalse(scrollToElementUtilSpy.called);
            assert.isFalse(activeElementChangedCallbackSpy.called);
            assert.isFalse(itemsEndedCallbackSpy.called);
            assert.isFalse(hasItemsOutRangeChangedCallbackSpy.called);
            assert.isFalse(updateVirtualNavigationUtilSpy.called);
            assert.isFalse(updatePlaceholdersUtilSpy.called);
            assert.isFalse(updateShadowsUtilSpy.called);
        });
    });

    describe('beforeUnmountListControl', () => {
        it('should reset scrollContainer state', () => {
            controller.beforeUnmountListControl();
            assert.isTrue(updateVirtualNavigationUtilSpy.withArgs({backward: false, forward: false}).called);
            assert.isTrue(updatePlaceholdersUtilSpy.withArgs({backward: 0, forward: 0}).called);
        });
    });

    describe('setPredicatedRestoreDirection', () => {
        it('should restore by passed direction(imitate expand node)', () => {
            controller.afterMountListControl();
            controller.scrollPositionChange(100);
            controller.contentResized(250);
            controller.viewportResized(100);

            const recordSet = collection.getCollection() as unknown as RecordSet;
            recordSet.add(new Model({rawData: {key: 31, height: 50}}), 2);
            controller.setPredicatedRestoreDirection('backward');
            controller.addItems(2, 1, 'fixed', 'shift');
            resetHistoryCallbacks();

            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            assert.isTrue(doScrollUtilSpy.withArgs(50).called);
        });
    });

    describe('setCollection', () => {
        it('should set iterator to collection', () => {
            const newCollection = getCollection([]);
            const setIteratorSpy = spy(newCollection, 'setViewIterator');
            controller.setCollection(newCollection);
            assert.isTrue(setIteratorSpy.calledOnce);
        });
    });

    describe('addItems', () => {
        it('should update indexes on collection', () => {
            controller.afterMountListControl();
            controller.scrollPositionChange(100);
            controller.contentResized(250);
            controller.viewportResized(100);
            resetHistoryCallbacks();

            const recordSet = collection.getCollection() as unknown as RecordSet;
            recordSet.add(new Model({rawData: {key: 0, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -1, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -2, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -3, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -4, height: 50}}), 0);
            controller.addItems(0, 5, 'fixed', 'shift');

            assert.equal(collection.getStartIndex(), 3);
            assert.equal(collection.getStopIndex(), 8);
        });

        it('should restore scroll', () => {
            controller.afterMountListControl();
            controller.scrollPositionChange(100);
            controller.contentResized(250);
            controller.viewportResized(100);
            resetHistoryCallbacks();

            const recordSet = collection.getCollection() as unknown as RecordSet;
            recordSet.add(new Model({rawData: {key: 0, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -1, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -2, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -3, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -4, height: 50}}), 0);
            controller.addItems(0, 5, 'fixed', 'shift');

            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            assert.isTrue(doScrollUtilSpy.withArgs(200).called);
        });

        it('not should restore scroll, because pass param scrollMode=unfixed', () => {
            controller.afterMountListControl();
            controller.scrollPositionChange(100);
            controller.contentResized(250);
            controller.viewportResized(100);
            resetHistoryCallbacks();

            const recordSet = collection.getCollection() as unknown as RecordSet;
            recordSet.add(new Model({rawData: {key: 0, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -1, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -2, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -3, height: 50}}), 0);
            recordSet.add(new Model({rawData: {key: -4, height: 50}}), 0);
            controller.addItems(0, 5, 'unfixed', 'shift');

            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            assert.isFalse(doScrollUtilSpy.called);
        });
    });

    describe('removeItems', () => {
        it('should update indexes on collection', () => {
            controller.afterMountListControl();
            controller.scrollPositionChange(100);
            controller.contentResized(250);
            controller.viewportResized(100);
            resetHistoryCallbacks();

            const recordSet = collection.getCollection() as unknown as RecordSet;
            recordSet.removeAt(2);
            recordSet.removeAt(2);
            controller.removeItems(2, 2, 'fixed');

            assert.equal(collection.getStartIndex(), 0);
            assert.equal(collection.getStopIndex(), 5);
        });

        it('not should restore scroll, because indexes is not changed', () => {
            controller.afterMountListControl();
            controller.scrollPositionChange(100);
            controller.contentResized(250);
            controller.viewportResized(100);
            resetHistoryCallbacks();

            const recordSet = collection.getCollection() as unknown as RecordSet;
            recordSet.removeAt(2);
            recordSet.removeAt(2);
            controller.removeItems(2, 2, 'fixed');

            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            assert.isFalse(doScrollUtilSpy.called);
        });
    });

    describe('resetItems', () => {
        it('should set indexes to collection', () => {
            controller.resetItems();
            assert.equal(collection.getStartIndex(), 0);
            assert.equal(collection.getStopIndex(), 5);
        });

        it('should scroll to top after on render', () => {
            controller.scrollPositionChange(100);
            controller.resetItems();
            controller.beforeRenderListControl();
            assert.isTrue(doScrollUtilSpy.withArgs('top').called);
        });

        it('not should scroll to top after on render, because enable keep scroll', () => {
            controller.scrollPositionChange(100);
            controller.enableKeepScrollPosition();
            controller.resetItems();
            controller.beforeRenderListControl();
            assert.isFalse(doScrollUtilSpy.called);
        });

        it('disableKeepScrollPosition => reset scroll position', () => {
            controller.scrollPositionChange(100);
            controller.enableKeepScrollPosition();
            controller.disableKeepScrollPosition();
            controller.resetItems();
            controller.beforeRenderListControl();
            assert.isTrue(doScrollUtilSpy.withArgs('top').called);
        });

        it('not should scroll to top after on render, because was not scroll', () => {
            controller.resetItems();
            controller.beforeRenderListControl();
            assert.isFalse(doScrollUtilSpy.called);
        });

        it('should start range with activeElement', () => {
            controller.setActiveElementKey(3);
            controller.resetItems();
            assert.equal(collection.getStartIndex(), 2);
            assert.equal(collection.getStopIndex(), 7);
        });

        it('should scroll to active element', () => {
            controller.setActiveElementKey(3);
            controller.scrollPositionChange(100);
            resetHistoryCallbacks();

            controller.resetItems();
            controller.beforeRenderListControl();
            // скроллим только после отрисовки новых индексов
            assert.isFalse(scrollToElementUtilSpy.called);
            controller.afterRenderListControl();

            const activeElement = itemsContainer.querySelector('div[item-key="3"]');
            assert.isTrue(scrollToElementUtilSpy.withArgs(activeElement, 'top', true).called);
            assert.isTrue(updateShadowsUtilSpy.withArgs({backward: true, forward: true}).called);
            assert.isTrue(hasItemsOutRangeChangedCallbackSpy.withArgs({backward: true, forward: true}).called);
            assert.isTrue(updateVirtualNavigationUtilSpy.withArgs({backward: true, forward: true}).called);
            assert.isTrue(updatePlaceholdersUtilSpy.withArgs({backward: 0, forward: 0}).called);
            sandbox.assert.callOrder(
                hasItemsOutRangeChangedCallbackSpy,
                updateVirtualNavigationUtilSpy,
                updatePlaceholdersUtilSpy,
                updateShadowsUtilSpy,
                scrollToElementUtilSpy
            );

            assert.isFalse(doScrollUtilSpy.called);
            assert.isFalse(itemsEndedCallbackSpy.called);
            assert.isFalse(activeElementChangedCallbackSpy.called);
        });

        it('should restore scroll', () => {
            controller.scrollPositionChange(100);
            controller.enableRestoreScrollPosition();
            resetHistoryCallbacks();

            controller.resetItems();
            controller.beforeRenderListControl();
            controller.afterRenderListControl();

            assert.isTrue(doScrollUtilSpy.withArgs(100).called);
            assert.isTrue(hasItemsOutRangeChangedCallbackSpy.withArgs({backward: false, forward: true}).called);
            assert.isTrue(updateShadowsUtilSpy.withArgs({backward: false, forward: true}).called);
            assert.isTrue(updateVirtualNavigationUtilSpy.withArgs({backward: false, forward: true}).called);
            assert.isTrue(updatePlaceholdersUtilSpy.withArgs({backward: 0, forward: 0}).called);
            sandbox.assert.callOrder(
                hasItemsOutRangeChangedCallbackSpy,
                updateVirtualNavigationUtilSpy,
                updatePlaceholdersUtilSpy,
                updateShadowsUtilSpy,
                doScrollUtilSpy
            );

            assert.isFalse(itemsEndedCallbackSpy.called);
            assert.isFalse(activeElementChangedCallbackSpy.called);
            assert.isFalse(scrollToElementUtilSpy.called);
        });
    });

    describe('scrollToItem', () => {
        it('scroll before render(indexes is not changed)', () => {
            controller.afterMountListControl();
            resetHistoryCallbacks();

            controller.scrollToItem(2, 'top', true);
            const activeElement = itemsContainer.querySelector('div[item-key="2"]');
            assert.isTrue(scrollToElementUtilSpy.withArgs(activeElement, 'top', true).called);

            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();

            // проверяем что скролл вызвался только один раз
            assert.isTrue(scrollToElementUtilSpy.calledOnce);
        });

        it('scroll after render new indexes', () => {
            controller.scrollToItem(6, 'bottom', false);
            assert.isFalse(scrollToElementUtilSpy.called);
            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            const activeElement = itemsContainer.querySelector('div[item-key="6"]');
            assert.isTrue(scrollToElementUtilSpy.withArgs(activeElement, 'bottom', false).called);
        });

        it('not should scroll if item is not exists', () => {
            controller.scrollToItem(999);
            assert.isFalse(scrollToElementUtilSpy.called);
            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            assert.isFalse(scrollToElementUtilSpy.called);
        });
    });

    describe('scrollToPage', () => {
        describe('scroll on page', () => {
            it('scroll to forward', () => {
                controller.afterMountListControl();
                controller.contentResized(250);
                controller.viewportResized(100);

                const result = controller.scrollToPage('forward');
                controller.scrollPositionChange(100);
                return result.then((firstVisibleItemKey) => {
                    assert.equal(firstVisibleItemKey, 3);
                    assert.isFalse(scrollToElementUtilSpy.called);
                    assert.isTrue(doScrollUtilSpy.withArgs('pageDown').called);
                });
            });

            it('scroll to backward', () => {
                controller.afterMountListControl();
                controller.contentResized(250);
                controller.viewportResized(100);
                controller.scrollPositionChange(100);

                const result = controller.scrollToPage('backward');
                controller.scrollPositionChange(0);
                return result.then((firstVisibleItemKey) => {
                    assert.equal(firstVisibleItemKey, 1);
                    assert.isFalse(scrollToElementUtilSpy.called);
                    assert.isTrue(doScrollUtilSpy.withArgs('pageUp').called);
                });
            });
        });
    });

    describe('scrollToEdge', () => {
        it('scroll to forward', () => {
            controller.scrollToEdge('forward');
            assert.isFalse(scrollToElementUtilSpy.called);
            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();
            controller.scrollPositionChange(100);

            const activeElement = itemsContainer.querySelector('div[item-key="10"]');
            assert.isTrue(scrollToElementUtilSpy.withArgs(activeElement, 'top', true).called);
        });

        it('scroll to backward', () => {
            controller.scrollPositionChange(100);
            controller.scrollToEdge('backward');
            assert.isFalse(scrollToElementUtilSpy.called);
            controller.beforeRenderListControl();
            renderCollectionChanges(itemsContainer, collection);
            controller.afterRenderListControl();

            const activeElement = itemsContainer.querySelector('div[item-key="1"]');
            assert.isTrue(scrollToElementUtilSpy.withArgs(activeElement, 'bottom', true).called);
        });
    });
});
