import jsdom = require('jsdom');
import { assert } from 'chai';
import { stub } from 'sinon';

import {
    IItemsSizesControllerOptions as ControllerOptions
} from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController/ItemsSizeController';
import {
    getCollection, getItemsContainer,
    getListContainer,
    ItemClass,
    ItemsContainerUniqueClass,
    ListContainerUniqueClass
} from 'ControlsUnit/list_clean/scroll/initUtils';
import { ItemsSizeController } from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController/ItemsSizeController';
import { Collection } from 'Controls/display';

function getDefaultControllerOptions(): ControllerOptions {
    return {
        listContainer: null,
        itemsContainer: null,
        itemsQuerySelector: `.${ItemsContainerUniqueClass} > .${ItemClass}`,
        totalCount: 0
    };
}

function getController(options: Partial<ControllerOptions>): ItemsSizeController {
    return new ItemsSizeController({
        ...getDefaultControllerOptions(),
        ...options
    });
}

function getScrollContainerWithList(collection: Collection, beforeListContent?: HTMLElement): HTMLElement {
    const listContainer = getListContainer(collection);

    const dom = new jsdom.JSDOM('<div class="controls-Scroll-ContainerBase__content"></div>');
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
    const dom = new jsdom.JSDOM('<div class="beforeListContent"></div>');
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

describe('Controls/_baseList/Controllers/AbstractItemsSizesController', () => {
    before(() => {
        window = new jsdom.JSDOM('').window;
    });

    after(() => {
        window = {};
    });

    describe('constructor', () => {
        it('default', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });

            assert.equal(controller.getItemsSizes().length, 3);
            assert.deepEqual(controller.getItemsSizes()[0], {size: 0, offset: 0});
            assert.deepEqual(controller.getItemsSizes()[1], {size: 0, offset: 0});
            assert.deepEqual(controller.getItemsSizes()[2], {size: 0, offset: 0});
        });
    });

    describe('updateItemsSizes', () => {
        it('should update sizes in range', () => {
            const collection = getCollection([
                {key: 1, height: 15},
                {key: 2, height: 20},
                {key: 3, height: 30},
                {key: 4, height: 20}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 4
            });

            controller.updateItemsSizes({startIndex: 0, endIndex: 4});
            assert.equal(controller.getItemsSizes().length, 4);
            assert.deepEqual(controller.getItemsSizes()[0], {size: 15, offset: 0});
            assert.deepEqual(controller.getItemsSizes()[1], {size: 20, offset: 15});
            assert.deepEqual(controller.getItemsSizes()[2], {size: 30, offset: 35});
            assert.deepEqual(controller.getItemsSizes()[3], {size: 20, offset: 65});
        });
    });

    describe('getElement', () => {
        it('should return element by key', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            const element = controller.getElement(2);
            assert.isOk(element);
            assert.equal(element.getAttribute('item-key'), '2');
        });
    });

    describe('getContentSizeBeforeItems', () => {
       it('not has content', () => {
           const collection = getCollection([
               {key: 1, height: '15px'},
               {key: 2, height: '20px'},
               {key: 3, height: '30px'}
           ]);
           const scrollContainer = getScrollContainerWithList(collection);
           const itemsContainer = scrollContainer.querySelector(`.${ItemsContainerUniqueClass}`) as HTMLElement;
           const controller = getController({
               itemsContainer,
               totalCount: 3
           });
           assert.equal(controller.getContentSizeBeforeItems(), 0);
       });

       it('before items displayed indicator', () => {
           const collection = getCollection([
               {key: 1, height: '15px'},
               {key: 2, height: '20px'},
               {key: 3, height: '30px'}
           ]);
           collection.displayIndicator('top', 'loading');
           const scrollContainer = getScrollContainerWithList(collection);
           const itemsContainer = scrollContainer.querySelector(`.${ItemsContainerUniqueClass}`) as HTMLElement;
           const controller = getController({
               itemsContainer,
               totalCount: 3
           });
           assert.equal(controller.getContentSizeBeforeItems(), 48);
       });
    });

    describe('getContentSizeBeforeList', () => {
       it('not has content', () => {
           const collection = getCollection([
               {key: 1, height: '15px'},
               {key: 2, height: '20px'},
               {key: 3, height: '30px'}
           ]);
           const scrollContainer = getScrollContainerWithList(collection);
           const itemsContainer = scrollContainer.querySelector(`.${ItemsContainerUniqueClass}`) as HTMLElement;
           const listContainer = scrollContainer.querySelector(`.${ListContainerUniqueClass}`) as HTMLElement;
           const controller = getController({
               itemsContainer,
               listContainer,
               totalCount: 3
           });
           assert.equal(controller.getContentSizeBeforeList(), 0);
       });

       it('has content before list', () => {
           const collection = getCollection([
               {key: 1, height: '15px'},
               {key: 2, height: '20px'},
               {key: 3, height: '30px'}
           ]);
           collection.displayIndicator('top', 'loading');

           const scrollContainer = getScrollContainerWithList(collection, getBeforeListContent());
           const itemsContainer = scrollContainer.querySelector(`.${ItemsContainerUniqueClass}`) as HTMLElement;
           const listContainer = scrollContainer.querySelector(`.${ListContainerUniqueClass}`) as HTMLElement;
           const controller = getController({
               itemsContainer,
               listContainer,
               totalCount: 3
           });
           assert.equal(controller.getContentSizeBeforeList(), 200);
       });
    });

    describe('setItemsContainer', () => {
        it('should change items container', () => {
            const collection = getCollection([
                {key: 1, height: 15},
                {key: 2, height: 20},
                {key: 3, height: 30}
            ]);
            const controller = getController({ totalCount: 3 });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});
            assert.deepEqual(controller.getItemsSizes()[0], {size: 0, offset: 0});
            assert.deepEqual(controller.getItemsSizes()[1], {size: 0, offset: 0});
            assert.deepEqual(controller.getItemsSizes()[2], {size: 0, offset: 0});

            controller.setItemsContainer(getItemsContainer(collection));
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});
            assert.deepEqual(controller.getItemsSizes()[0], {size: 15, offset: 0});
            assert.deepEqual(controller.getItemsSizes()[1], {size: 20, offset: 15});
            assert.deepEqual(controller.getItemsSizes()[2], {size: 30, offset: 35});
        });
    });

    describe('setListContainer', () => {
        it('should change list container', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            collection.displayIndicator('top', 'loading');

            const scrollContainer = getScrollContainerWithList(collection, getBeforeListContent());
            const itemsContainer = scrollContainer.querySelector(`.${ItemsContainerUniqueClass}`) as HTMLElement;
            const listContainer = scrollContainer.querySelector(`.${ListContainerUniqueClass}`) as HTMLElement;
            const controller = getController({
                itemsContainer,
                totalCount: 3
            });
            assert.equal(controller.getContentSizeBeforeList(), null);

            controller.setListContainer(listContainer);
            assert.equal(controller.getContentSizeBeforeList(), 200);
        });
    });

    describe('addItems', () => {
        it('add to start', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.addItems(0, 1);
            assert.equal(controller.getItemsSizes().length, 4);
            assert.deepEqual(controller.getItemsSizes()[0], {size: 0, offset: 0});
        });

        it('add to middle', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.addItems(1, 1);
            assert.equal(controller.getItemsSizes().length, 4);
            assert.deepEqual(controller.getItemsSizes()[1], {size: 0, offset: 0});
        });

        it('add to end', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.addItems(3, 1);
            assert.equal(controller.getItemsSizes().length, 4);
            assert.deepEqual(controller.getItemsSizes()[3], {size: 0, offset: 0});
        });

        it('add two items', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.addItems(0, 2);
            assert.equal(controller.getItemsSizes().length, 5);
            assert.deepEqual(controller.getItemsSizes()[0], {size: 0, offset: 0});
            assert.deepEqual(controller.getItemsSizes()[1], {size: 0, offset: 0});
        });
    });

    describe('moveItems', () => {
        it('should move items sizes', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.moveItems(0, 1, 3, 1);
            assert.equal(controller.getItemsSizes().length, 3);
        });
    });

    describe('removeItems', () => {
        it('remove from start', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.removeItems(0, 1);
            assert.equal(controller.getItemsSizes().length, 2);
        });

        it('remove from middle', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.removeItems(1, 1);
            assert.equal(controller.getItemsSizes().length, 2);
        });

        it('remove from end', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.removeItems(2, 1);
            assert.equal(controller.getItemsSizes().length, 2);
        });

        it('remove two items', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.removeItems(0, 2);
            assert.equal(controller.getItemsSizes().length, 1);
        });
    });

    describe('resetItems', () => {
        it('should create array from empty sizes', () => {
            const collection = getCollection([
                {key: 1, height: '15px'},
                {key: 2, height: '20px'},
                {key: 3, height: '30px'}
            ]);
            const controller = getController({
                itemsContainer: getItemsContainer(collection),
                totalCount: 3
            });
            controller.updateItemsSizes({startIndex: 0, endIndex: 3});

            controller.resetItems(2);
            assert.equal(controller.getItemsSizes().length, 2);
            assert.deepEqual(controller.getItemsSizes()[0], {size: 0, offset: 0});
            assert.deepEqual(controller.getItemsSizes()[1], {size: 0, offset: 0});
        });
    });
});
