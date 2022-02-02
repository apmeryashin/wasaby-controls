import jsdom = require('jsdom');
const { JSDOM } = jsdom;
import { assert } from 'chai';
import { stub } from 'sinon';

import {
    getCollection, getItemsContainer,
    getListContainer,
    ItemClass,
    ItemsContainerUniqueClass,
    ListContainerUniqueClass
} from 'ControlsUnit/list_clean/scroll/initUtils';
import { ItemsSizeController } from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController/ItemsSizeController';
import { Collection } from 'Controls/display';

function getScrollContainerWithList(collection: Collection, beforeListContent?: HTMLElement): HTMLElement {
    const listContainer = getListContainer(collection);

    const dom = new JSDOM('<div class="controls-Scroll-ContainerBase__content"></div>');
    const scrollContainer: HTMLElement = dom.window.document.querySelector('.controls-Scroll-ContainerBase__content');
    const itemsContainer = listContainer.querySelector(`.${ItemsContainerUniqueClass}`) as HTMLElement;

    stub(scrollContainer, 'getBoundingClientRect').callsFake(() => {
        return {
            width: 300,
            height: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        } as DOMRect;
    });
    stub(itemsContainer, 'getBoundingClientRect').callsFake(() => {
        const beforeListOffset = beforeListContent?.getBoundingClientRect().height || 0;
        const indicatorOffset = collection.getTopIndicator().isDisplayed() ? 48 : 0;
        return {
            width: 300,
            height: 0,
            top: beforeListOffset + indicatorOffset,
            left: 0,
            right: 0,
            bottom: 0
        } as DOMRect;
    });
    stub(listContainer, 'getBoundingClientRect').callsFake(() => {
        const beforeListOffset = beforeListContent?.getBoundingClientRect().height || 0;
        return {
            width: 300,
            height: 0,
            top: beforeListOffset,
            left: 0,
            right: 0,
            bottom: 0
        } as DOMRect;
    });

    if (beforeListContent) {
        scrollContainer.appendChild(beforeListContent);
    }
    scrollContainer.appendChild(listContainer);

    return scrollContainer;
}

function getBeforeListContent(): HTMLElement {
    const dom = new JSDOM('<div class="beforeListContent"></div>');
    const beforeListContent: HTMLElement = dom.window.document.querySelector('.beforeListContent');

    stub(beforeListContent, 'getBoundingClientRect').callsFake(() => {
        return {
            width: 300,
            height: 200,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        } as DOMRect;
    });

    return beforeListContent;
}

const EMPTY_SIZE = {size: 0, offset: 0};

describe('Controls/_baseList/Controllers/AbstractItemsSizesController', () => {
    let collection;
    let controller: ItemsSizeController;
    let scrollContainer: HTMLElement;
    let listContainer: HTMLElement;
    let itemsContainer: HTMLElement;

    before(() => {
        window = new JSDOM('').window;
    });

    after(() => {
        window = {};
    });

    beforeEach(() => {
        collection = getCollection([
            {key: 1, height: 15},
            {key: 2, height: 20},
            {key: 3, height: 30}
        ]);

        scrollContainer = getScrollContainerWithList(collection);
        itemsContainer = scrollContainer.querySelector(`.${ItemsContainerUniqueClass}`) as HTMLElement;
        listContainer = scrollContainer.querySelector(`.${ListContainerUniqueClass}`) as HTMLElement;

        controller = new ItemsSizeController({
            itemsContainer,
            listContainer,
            itemsQuerySelector: `.${ItemsContainerUniqueClass} > .${ItemClass}`,
            totalCount: collection.getCount()
        });
    });

    afterEach(() => {
        collection = null;
        controller = null;
        scrollContainer = null;
        listContainer = null;
        itemsContainer = null;
    });

    describe('constructor', () => {
        it('should init itemsSizes and fill it empty values', () => {
            const itemsSizes = controller.getItemsSizes();
            assert.equal(itemsSizes.length, 3);
            assert.deepEqual(itemsSizes, [EMPTY_SIZE, EMPTY_SIZE, EMPTY_SIZE]);
        });
    });

    describe('updateItemsSizes', () => {
        it('should update sizes in range', () => {
            const itemsSizes = controller.updateItemsSizes({startIndex: 0, endIndex: 3});
            assert.equal(itemsSizes.length, 3);
            assert.deepEqual(
                itemsSizes,
                [
                    {size: 15, offset: 0, key: '1'},
                    {size: 20, offset: 15, key: '2'},
                    {size: 30, offset: 35, key: '3'}
                ]
            );
        });
    });

    describe('getElement', () => {
        it('should return element by key', () => {
            const element = controller.getElement(2);
            assert.isOk(element);
            assert.equal(element.getAttribute('item-key'), '2');
        });
    });

    describe('getContentSizeBeforeItems', () => {
       it('not has content', () => {
           assert.equal(controller.getContentSizeBeforeItems(), 0);
       });

       it('before items displayed indicator', () => {
           collection.displayIndicator('top', 'loading');
           assert.equal(controller.getContentSizeBeforeItems(), 48);
       });
    });

    describe('getContentSizeBeforeList', () => {
       it('not has content', () => {
           assert.equal(controller.getContentSizeBeforeList(), 0);
       });

       it('not calc content before items', () => {
           collection.displayIndicator('top', 'loading');
           assert.equal(controller.getContentSizeBeforeList(), 0);
       });

       it('has content before list', () => {
           const scrollContainer = getScrollContainerWithList(collection, getBeforeListContent());
           const listContainer = scrollContainer.querySelector(`.${ListContainerUniqueClass}`);
           controller.setListContainer(listContainer as HTMLElement);
           assert.equal(controller.getContentSizeBeforeList(), 200);
       });
    });

    describe('setItemsContainer', () => {
        it('should change items container', () => {
            collection.at(0).contents.set('height', 30);
            collection.at(1).contents.set('height', 30);
            collection.at(2).contents.set('height', 30);
            controller.setItemsContainer(getItemsContainer(collection));

            assert.deepEqual(controller.getItemsSizes(), [EMPTY_SIZE, EMPTY_SIZE, EMPTY_SIZE]);

            const itemsSizes = controller.updateItemsSizes({startIndex: 0, endIndex: 3});
            assert.deepEqual(
                itemsSizes,
                [
                    {size: 30, offset: 0, key: '1'},
                    {size: 30, offset: 30, key: '2'},
                    {size: 30, offset: 60, key: '3'}
                ]
            );
        });
    });

    describe('setListContainer', () => {
        it('should change list container', () => {
            assert.equal(controller.getContentSizeBeforeList(), 0);

            const scrollContainer = getScrollContainerWithList(collection, getBeforeListContent());
            const listContainer = scrollContainer.querySelector(`.${ListContainerUniqueClass}`);
            controller.setListContainer(listContainer as HTMLElement);
            assert.equal(controller.getContentSizeBeforeList(), 200);
        });
    });

    describe('setItemsQuerySelector', () => {
        it('should change items selector', () => {
            assert.isOk(controller.getElement(2));
            controller.setItemsQuerySelector('.newItemSelector');
            assert.isNotOk(controller.getElement(2));
        });
    });

    describe('onCollectionChange', () => {
        beforeEach(() => {
           controller.updateItemsSizes({startIndex: 0, endIndex: 3});
        });

        describe('addItems', () => {
            it('add to start', () => {
                const itemsSizes = controller.addItems(0, 1);
                assert.equal(itemsSizes.length, 4);
                assert.deepEqual(
                    itemsSizes,
                    [
                        EMPTY_SIZE,
                        {size: 15, offset: 0, key: '1'},
                        {size: 20, offset: 15, key: '2'},
                        {size: 30, offset: 35, key: '3'}
                    ]
                );
            });

            it('add to middle', () => {
                const itemsSizes = controller.addItems(1, 1);
                assert.equal(itemsSizes.length, 4);
                assert.deepEqual(
                    itemsSizes,
                    [
                        {size: 15, offset: 0, key: '1'},
                        EMPTY_SIZE,
                        {size: 20, offset: 15, key: '2'},
                        {size: 30, offset: 35, key: '3'}
                    ]
                );
            });

            it('add to end', () => {
                const itemsSizes = controller.addItems(3, 1);
                assert.equal(itemsSizes.length, 4);
                assert.deepEqual(
                    itemsSizes,
                    [
                        {size: 15, offset: 0, key: '1'},
                        {size: 20, offset: 15, key: '2'},
                        {size: 30, offset: 35, key: '3'},
                        EMPTY_SIZE
                    ]
                );
            });

            it('add two items to start', () => {
                const itemsSizes = controller.addItems(0, 2);
                assert.equal(itemsSizes.length, 5);
                assert.deepEqual(
                    itemsSizes,
                    [
                        EMPTY_SIZE,
                        EMPTY_SIZE,
                        {size: 15, offset: 0, key: '1'},
                        {size: 20, offset: 15, key: '2'},
                        {size: 30, offset: 35, key: '3'}
                    ]
                );
            });
        });

        describe('moveItems', () => {
            it('should move items sizes', () => {
                const itemsSizes = controller.moveItems(0, 1, 2, 1);
                assert.equal(itemsSizes.length, 3);
                assert.deepEqual(
                    itemsSizes,
                    [
                        EMPTY_SIZE,
                        {size: 15, offset: 0, key: '1'},
                        {size: 30, offset: 35, key: '3'}
                    ]
                );
            });
        });

        describe('removeItems', () => {
            it('remove from start', () => {
                const itemsSizes = controller.removeItems(0, 1);
                assert.equal(itemsSizes.length, 2);
                assert.deepEqual(itemsSizes, [{size: 20, offset: 15, key: '2'}, {size: 30, offset: 35, key: '3'}]);
            });

            it('remove from middle', () => {
                const itemsSizes = controller.removeItems(1, 1);
                assert.equal(controller.getItemsSizes().length, 2);
                assert.deepEqual(itemsSizes, [{size: 15, offset: 0, key: '1'}, {size: 30, offset: 35, key: '3'}]);
            });

            it('remove from end', () => {
                const itemsSizes = controller.removeItems(2, 1);
                assert.equal(controller.getItemsSizes().length, 2);
                assert.deepEqual(itemsSizes, [{size: 15, offset: 0, key: '1'}, {size: 20, offset: 15, key: '2'}]);
            });

            it('remove two items from start', () => {
                const itemsSizes = controller.removeItems(0, 2);
                assert.equal(controller.getItemsSizes().length, 1);
                assert.deepEqual(itemsSizes, [{size: 30, offset: 35, key: '3'}]);
            });
        });

        describe('resetItems', () => {
            it('should create array from empty sizes', () => {
                const itemsSizes = controller.resetItems(2);
                assert.equal(itemsSizes.length, 2);
                assert.deepEqual(itemsSizes, [EMPTY_SIZE, EMPTY_SIZE]);
            });
        });
    });
});
