import jsdom = require('jsdom');
const { JSDOM } = jsdom;
import { assert } from 'chai';

import {
    ItemClass,
    ItemsContainerUniqueClass
} from 'ControlsUnit/list_clean/scroll/initUtils';
import ItemsSizeControllerMultiColumns from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController/ItemsSizeControllerMultiColumns';
import {stub} from 'sinon';
import { ColumnsCollection, ColumnsCollectionItem } from 'Controls/columns';
import {RecordSet} from 'Types/collection';

function getItemElement(item: ColumnsCollectionItem): HTMLElement {
    const dom = new JSDOM('');

    const itemElement: HTMLElement = dom.window.document.createElement('div');

    itemElement.className = ItemClass;
    itemElement.setAttribute('item-key', item.key);

    const collection = item.getOwner() as ColumnsCollection;
    const column = item.getColumn();
    const itemsColumn = collection.getItems().filter((it) => it.getColumn() === column);

    let top = 0;
    for (let i = 0; i < itemsColumn.length; i++) {
        if (itemsColumn[i] === item) {
            break;
        }
        top += itemsColumn[i].contents.get('height') || 0;
    }

    stub(itemElement, 'getBoundingClientRect').callsFake(() => {
        return {
            width: item.contents.get('width') || 0,
            height: item.contents.get('height') || 0,
            top,
            left: 0,
            right: 0,
            bottom: 0
        } as DOMRect;
    });

    return itemElement;
}

function getItemsContainer(collection: ColumnsCollection): HTMLElement {
    const dom = new JSDOM(`<div class="${ItemsContainerUniqueClass}"></div>`);

    const itemsContainer: HTMLElement = dom.window.document.querySelector(`.${ItemsContainerUniqueClass}`);

    collection.each((item) => {
        const itemElement = getItemElement(item);
        itemsContainer.appendChild(itemElement);
    });

    return itemsContainer;
}

describe('Controls/_baseList/Controllers/ItemsSizeControllerMultiColumns', () => {
    let collection;
    let controller: ItemsSizeControllerMultiColumns;
    let itemsContainer: HTMLElement;

    before(() => {
        window = new JSDOM('').window;
    });

    after(() => {
        window = {};
    });

    beforeEach(() => {
        collection = new ColumnsCollection({
            collection: new RecordSet({
                rawData: [
                    {key: 1, height: 20},
                    {key: 2, height: 20},
                    {key: 3, height: 20},
                    {key: 4, height: 20}
                ],
                keyProperty: 'key'
            }),
            keyProperty: 'key',
            columnsCount: 2
        });

        itemsContainer = getItemsContainer(collection);

        controller = new ItemsSizeControllerMultiColumns({
            itemsContainer,
            itemsQuerySelector: `.${ItemsContainerUniqueClass} > .${ItemClass}`,
            totalCount: collection.getCount()
        });

    });

    afterEach(() => {
        collection = null;
        controller = null;
        itemsContainer = null;
    });

    describe('updateItemsSizes', () => {
        it('should update sizes in range', () => {
            const itemsSizes = controller.updateItemsSizes({startIndex: 0, endIndex: 4});
            assert.equal(itemsSizes.length, 4);
            assert.deepEqual(
                itemsSizes,
                [
                    {size: 20, offset: 0, key: '1'},
                    {size: 20, offset: 0, key: '2'},
                    {size: 20, offset: 20, key: '3'},
                    {size: 20, offset: 20, key: '4'}
                ]
            );
        });

        it('update items sizes after shift range', () => {
            let itemsSizes = controller.updateItemsSizes({startIndex: 0, endIndex: 4});

            controller.addItems(4, 4);
            const collection = new ColumnsCollection({
                collection: new RecordSet({
                    rawData: [
                        {key: 5, height: 20},
                        {key: 6, height: 20},
                        {key: 7, height: 20},
                        {key: 8, height: 20}
                    ],
                    keyProperty: 'key'
                }),
                keyProperty: 'key',
                columnsCount: 2
            });

            const itemsContainer = getItemsContainer(collection);
            controller.setItemsContainer(itemsContainer);

            itemsSizes = controller.updateItemsSizes({startIndex: 4, endIndex: 8});
            assert.equal(itemsSizes.length, 8);
            assert.deepEqual(
                itemsSizes,
                [
                    {size: 20, offset: 0, key: '1'},
                    {size: 20, offset: 0, key: '2'},
                    {size: 20, offset: 20, key: '3'},
                    {size: 20, offset: 20, key: '4'},
                    {size: 20, offset: 40, key: '5'},
                    {size: 20, offset: 40, key: '6'},
                    {size: 20, offset: 60, key: '7'},
                    {size: 20, offset: 60, key: '8'}
                ]
            );
        });

        it('update items sizes after add to start', () => {
            let itemsSizes = controller.updateItemsSizes({startIndex: 0, endIndex: 4});

            controller.addItems(0, 4);
            const collection = new ColumnsCollection({
                collection: new RecordSet({
                    rawData: [
                        {key: 5, height: 20},
                        {key: 6, height: 20},
                        {key: 7, height: 20},
                        {key: 8, height: 20}
                    ],
                    keyProperty: 'key'
                }),
                keyProperty: 'key',
                columnsCount: 2
            });

            const itemsContainer = getItemsContainer(collection);
            controller.setItemsContainer(itemsContainer);

            itemsSizes = controller.updateItemsSizes({startIndex: 0, endIndex: 4});
            assert.equal(itemsSizes.length, 8);
            assert.deepEqual(
                itemsSizes,
                [
                    {size: 20, offset: 0, key: '5'},
                    {size: 20, offset: 0, key: '6'},
                    {size: 20, offset: 20, key: '7'},
                    {size: 20, offset: 20, key: '8'},
                    {size: 20, offset: 40, key: '1'},
                    {size: 20, offset: 40, key: '2'},
                    {size: 20, offset: 60, key: '3'},
                    {size: 20, offset: 60, key: '4'}
                ]
            );
        });
    });
});
