import { IBaseCollection } from '../interface';
import { IViewIterator } from '../Collection';
import { EnumeratorCallback } from 'Types/collection';

export interface IVirtualScrollEnumerator {
    setPosition(pos: number): void;
    moveNext(): boolean;
    getCurrentIndex(): number;
    getCurrent(): unknown;
}

export interface IVirtualScrollViewIterator extends IViewIterator {
    data: {
        startIndex: number;
        stopIndex: number;
    };
}

export interface IVirtualScrollCollection extends IBaseCollection<unknown> {
    setViewIterator(viewIterator: IVirtualScrollViewIterator): void;
    getViewIterator(): IVirtualScrollViewIterator;
    getCount(): number;
    getEnumerator(): IVirtualScrollEnumerator;
}

export function setup(collection: IVirtualScrollCollection): void {
    collection.setViewIterator({
        each: each.bind(null, collection),
        setIndices: setIndices.bind(null, collection),
        isItemAtIndexHidden: () => false,
        data: {
            startIndex: 0,
            stopIndex: collection.getCount()
        }
    });
}

export function setIndices(
    collection: IVirtualScrollCollection,
    startIndex: number,
    stopIndex: number
): boolean {
    const currentViewIterator = collection.getViewIterator();
    if (currentViewIterator.data &&
        (currentViewIterator.data.startIndex !== startIndex || currentViewIterator.data.stopIndex !== stopIndex)) {
        const viewIterator = {
            ...collection.getViewIterator(),
            data: {
                startIndex,
                stopIndex
            }
        };
        collection.setViewIterator(viewIterator);
        collection.nextVersion();
    }
    return true;
}

export function each(
    collection: IVirtualScrollCollection,
    callback: EnumeratorCallback<unknown>,
    context?: object
): void {
    const startIndex = getStartIndex(collection);
    const stopIndex = getStopIndex(collection);
    const enumerator = collection.getEnumerator();
    const count = collection.getCount();
    const shouldStayInCollection = (item) => item && (
        (item.StickableItem && item.isSticked()) ||
        (item.EditableItem && item.isEditing())
    );

    let stickyItemBefore = null;
    let stickyItemAfter = null;
    enumerator.setPosition(-1);
    while (enumerator.moveNext() && enumerator.getCurrentIndex() < startIndex) {
        const current = enumerator.getCurrent() as any;
        if (current) {
            if (shouldStayInCollection(current)) {
                if (stickyItemBefore) {
                    stickyItemBefore.current.setRenderedOutsideRange(false);
                }
                stickyItemBefore = { current, index: enumerator.getCurrentIndex() };
            } else {
                current.setRenderedOutsideRange(false);
            }
        }
    }
    enumerator.setPosition(stopIndex - 1);
    while (enumerator.moveNext() && enumerator.getCurrentIndex() < count) {
        const current = enumerator.getCurrent() as any;
        if (current) {
            if (shouldStayInCollection(current)) {
                stickyItemAfter = { current, index: enumerator.getCurrentIndex() };
                break;
            } else {
                current.setRenderedOutsideRange(false);
            }
        }
    }

    if (stickyItemBefore) {
        stickyItemBefore.current.setRenderedOutsideRange(true);
        callback.call(
            context,
            stickyItemBefore.current,
            stickyItemBefore.index
        );
    }

    enumerator.setPosition(startIndex - 1);
    while (enumerator.moveNext() && enumerator.getCurrentIndex() < stopIndex) {
        const current = enumerator.getCurrent();
        current?.setRenderedOutsideRange(false);
        callback.call(
            context,
            current,
            enumerator.getCurrentIndex()
        );
    }

    if (stickyItemAfter) {
        stickyItemAfter.current.setRenderedOutsideRange(true);
        callback.call(
            context,
            stickyItemAfter.current,
            stickyItemAfter.index
        );
    }
}

export function getStartIndex(collection: IVirtualScrollCollection): number {
    return collection.getViewIterator()?.data?.startIndex ?? 0;
}

export function getStopIndex(collection: IVirtualScrollCollection): number {
    return collection.getViewIterator()?.data?.stopIndex ?? collection.getCount();
}
