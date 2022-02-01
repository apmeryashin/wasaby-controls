import * as VirtualScroll from './VirtualScroll';
import { EnumeratorCallback } from 'Types/collection';
import {getStartIndex, getStopIndex} from './VirtualScroll';

export interface IVirtualScrollHideItem {
    setRendered(rendered: boolean): void;
    isRendered(): boolean;
    isSticked(): boolean;
    setRenderedOutsideRange(state: boolean): void;
}

export interface IVirtualScrollHideEnumerator extends VirtualScroll.IVirtualScrollEnumerator {
    getCurrent(): IVirtualScrollHideItem;
}

export interface IVirtualScrollHideCollection extends VirtualScroll.IVirtualScrollCollection {
    at(pos: number): IVirtualScrollHideItem;
    getEnumerator(): IVirtualScrollHideEnumerator;
}

export function setup(collection: IVirtualScrollHideCollection): void {
    VirtualScroll.setup(collection);
    collection.setViewIterator({
        ...collection.getViewIterator(),
        each: each.bind(null, collection),
        setIndices: setIndices.bind(null, collection),
        isItemAtIndexHidden: isItemAtIndexHidden.bind(null, collection)
    });
    collection.nextVersion();
}

export function applyRenderedItems(collection: IVirtualScrollHideCollection): void {
    const renderedStart = VirtualScroll.getStartIndex(collection);
    const renderedStop = VirtualScroll.getStopIndex(collection);
    for (let i = renderedStart; i < renderedStop; i++) {
        collection.at(i)?.setRendered(true);
    }
}

export function setIndices(
    collection: IVirtualScrollHideCollection,
    startIndex: number,
    stopIndex: number
): boolean {
    const indicesChanged = VirtualScroll.setIndices(
        collection,
        startIndex,
        stopIndex
    );
    applyRenderedItems(collection);
    collection.nextVersion();
    return indicesChanged;
}

export function each(
    collection: IVirtualScrollHideCollection,
    callback: EnumeratorCallback<unknown>,
    context?: object
): void {
    const enumerator = collection.getEnumerator();
    const startIndex = getStartIndex(collection);
    const stopIndex = getStopIndex(collection);

    enumerator.setPosition(-1);

    while (enumerator.moveNext()) {
        const item = enumerator.getCurrent();
        const index = enumerator.getCurrentIndex();
        if (item.isRendered()) {
            callback.call(context, item, index);
        }

        if (index >= startIndex && index < stopIndex) {
            item.setRenderedOutsideRange(false);
        }
    }
}

export function isItemAtIndexHidden(
    collection: IVirtualScrollHideCollection,
    index: number
): boolean {
    const start = VirtualScroll.getStartIndex(collection);
    const stop = VirtualScroll.getStopIndex(collection);
    const current = collection.at(index);
    const shouldStayInCollection = (item) => item && (
        (item.StickableItem && item.isSticked()) ||
        (item.EditableItem && item.isEditing())
    );
    const isSticky = shouldStayInCollection(current);

    if (isSticky) {
        let tempIndex = index + 1;
        let tempItem;
        while (tempIndex < start) {
            tempItem = collection.at(tempIndex);
            if (shouldStayInCollection(tempItem)) {
                current.setRenderedOutsideRange(false);
                return true;
            }
            tempIndex++;
        }
        tempIndex = index - 1;
        while (tempIndex >= stop) {
            tempItem = collection.at(tempIndex);
            if (shouldStayInCollection(tempItem)) {
                current.setRenderedOutsideRange(false);
                return true;
            }
            tempIndex--;
        }
        if (index < start || index >= stop) {
            current.setRenderedOutsideRange(true);
        }
        return false;
    }

    return ( index < start || index >= stop );
}
