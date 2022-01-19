import jsdom = require('jsdom');

import {Collection, CollectionItem} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {BaseControl} from 'Controls/baseList';

type TGetItemElement = (item: CollectionItem) => HTMLElement;

export const ItemsContainerUniqueClass = 'itemsContainer';
export const ItemClass = 'item';
export const TriggerClass = 'trigger';

export function getCollection(items: object[]): Collection {
    return new Collection({
        collection: new RecordSet({
            rawData: items,
            keyProperty: 'key'
        }),
        keyProperty: 'key'
    });
}

export function getItemsContainer(collection: Collection, customGetItemElement?: TGetItemElement): HTMLElement {
    const dom = new jsdom.JSDOM(`<div class="${ItemsContainerUniqueClass}"></div>`);

    const itemsContainer: HTMLElement = dom.window.document.querySelector(`.${ItemsContainerUniqueClass}`);

    collection.each((item) => {
        const itemElement = customGetItemElement ? customGetItemElement(item) : getItemElement(item);
        itemsContainer.appendChild(itemElement);
    });

    return itemsContainer;
}

export function getListContainer(collection: Collection, customGetItemElement?: TGetItemElement): HTMLElement {
    const dom = new jsdom.JSDOM('<div class="listContainer"></div>');

    const listContainer: HTMLElement = dom.window.document.querySelector('.listContainer');

    listContainer.appendChild(getTriggerElement());
    listContainer.appendChild(getItemsContainer(collection, customGetItemElement));
    listContainer.appendChild(getTriggerElement());

    return listContainer;
}

export function getListContainerWithNestedList(collection: Collection, nestedCollection: Collection): HTMLElement {
    const dom = new jsdom.JSDOM('');

    const customGetItemElement: TGetItemElement = (item) => {
        const itemElement: HTMLElement = dom.window.document.createElement('div');

        itemElement.className = ItemClass;
        itemElement.setAttribute('item-key', item.key);
        // Вложенный список
        itemElement.appendChild(getListContainer(nestedCollection));

        return itemElement;
    };

    return getListContainer(collection, customGetItemElement);
}

export function getListControl(): BaseControl {
    return new BaseControl({}, {});
}

function getItemElement(item: CollectionItem): HTMLElement {
    const dom = new jsdom.JSDOM('');

    const itemElement: HTMLElement = dom.window.document.createElement('div');

    itemElement.className = ItemClass;
    itemElement.setAttribute('item-key', item.key);

    return itemElement;
}

function getTriggerElement(): HTMLElement {
    const dom = new jsdom.JSDOM('');

    const triggerElement: HTMLElement = dom.window.document.createElement('div');
    triggerElement.className = TriggerClass;
    return triggerElement;
}
