import jsdom = require('jsdom');
const { JSDOM } = jsdom;
import { stub } from 'sinon';

import {Collection, CollectionItem} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {BaseControl} from 'Controls/baseList';

type TGetItemElement = (item: CollectionItem) => HTMLElement;

export const ItemsContainerUniqueClass = 'itemsContainer';
export const ListContainerUniqueClass = 'listContainer';
export const ItemClass = 'item';
export const TriggerClass = 'trigger';
export const IndicatorClass = 'indicator';

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
    const dom = new JSDOM(`<div class="${ItemsContainerUniqueClass}"></div>`);

    const itemsContainer: HTMLElement = dom.window.document.querySelector(`.${ItemsContainerUniqueClass}`);

    collection.each((item) => {
        const itemElement = customGetItemElement ? customGetItemElement(item) : getItemElement(item);
        itemsContainer.appendChild(itemElement);
    });

    return itemsContainer;
}

export function getListContainer(collection: Collection, customGetItemElement?: TGetItemElement): HTMLElement {
    const dom = new JSDOM(`<div class="${ListContainerUniqueClass}"></div>`);

    const listContainer: HTMLElement = dom.window.document.querySelector(`.${ListContainerUniqueClass}`);

    if (collection.getTopIndicator().isDisplayed()) {
        listContainer.appendChild(getIndicatorElement());
    }
    listContainer.appendChild(getTriggerElement());
    listContainer.appendChild(getItemsContainer(collection, customGetItemElement));
    listContainer.appendChild(getTriggerElement());
    if (collection.getBottomIndicator().isDisplayed()) {
        listContainer.appendChild(getIndicatorElement());
    }

    return listContainer;
}

export function getListContainerWithNestedList(collection: Collection, nestedCollection: Collection): HTMLElement {
    const dom = new JSDOM('');

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
    const dom = new JSDOM('');

    const itemElement: HTMLElement = dom.window.document.createElement('div');

    itemElement.className = ItemClass;
    itemElement.setAttribute('item-key', item.key);

    stub(itemElement, 'getBoundingClientRect').callsFake(() => {
        return {
            width: item.contents.get('width') || 0,
            height: item.contents.get('height') || 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        } as DOMRect;
    });

    return itemElement;
}

function getTriggerElement(): HTMLElement {
    const dom = new JSDOM('');

    const triggerElement: HTMLElement = dom.window.document.createElement('div');
    triggerElement.className = TriggerClass;
    return triggerElement;
}

function getIndicatorElement(): HTMLElement {
    const dom = new JSDOM('');

    const indicatorElement: HTMLElement = dom.window.document.createElement('div');
    indicatorElement.className = IndicatorClass;
    stub(indicatorElement, 'getBoundingClientRect').callsFake(() => {
        return {
            width: 300,
            height: 48,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        } as DOMRect;
    });
    return indicatorElement;
}
