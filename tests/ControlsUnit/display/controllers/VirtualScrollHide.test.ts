import { assert } from 'chai';

import * as VirtualScrollHideController from 'Controls/_display/controllers/VirtualScrollHide';

describe('Controls/_display/controllers/VirtualScrollHide', () => {
    function makeHideItem() {
        const item = {
            _$rendered: false,
            isRendered: () => item._$rendered,
            setRendered: (rendered) => item._$rendered = rendered,
            setRenderedOutsideRange: () => null
        };
        return item;
    }

    function makeEnumerator() {
        const enumerator = {
            _$position: -1,
            getPosition: () => enumerator._$position,
            setPosition: (position) => enumerator._$position = position,
            getCurrentIndex: () => enumerator.getPosition(),

            moveNext: () => {
                enumerator._$position++;
                return true;
            },
            getCurrent: () => null
        };
        return enumerator;
    }

    function makeCollection() {
        const collection = {
            _$version: 0,
            nextVersion: () => collection._$version++,
            _$items: Array.from({ length: 100 }).map((_) => ({
                StickableItem: true,
                isSticked: () => false,
                setRenderedOutsideRange: () => null
            })),
            _$count: 100,
            getCount: () => collection._$count,

            _$viewIterator: null,
            getViewIterator: () => collection._$viewIterator,
            setViewIterator: (viewIterator) => collection._$viewIterator = viewIterator,

            getEnumerator: () => null,
            at: (index) => collection._$items[index]
        };
        return collection;
    }

    describe('setup()', () => {
        it('sets view iterator with required fields', () => {
            const collection = makeCollection();

            VirtualScrollHideController.setup(collection);

            assert.isFunction(collection._$viewIterator.each);
            assert.isFunction(collection._$viewIterator.setIndices);
            assert.isFunction(collection._$viewIterator.isItemAtIndexHidden);

            const { startIndex, stopIndex } = collection._$viewIterator.data;
            assert.strictEqual(startIndex, 0);
            assert.strictEqual(stopIndex, 100);

            assert.isAbove(collection._$version, 0);
        });
    });

    describe('setIndices()', () => {
        it('sets items from start to stop index as rendered', () => {
            const collection = makeCollection();

            const items = [];
            for (let i = 0; i < 10; i++) {
                items.push(makeHideItem());
            }

            collection._$count = items.length;
            collection.at = (index) => items[index];

            const startIndex = 5;
            const stopIndex = 8;

            VirtualScrollHideController.setup(collection);
            VirtualScrollHideController.setIndices(collection, startIndex, stopIndex);

            items.forEach((item, index) => {
                assert.strictEqual(item._$rendered, index >= startIndex && index < stopIndex,
                    `error at index ${index}. expected item's _$rendered to be ${!item._$rendered}`);
            });
        });
    });

    describe('each()', () => {
        it('iterates over all rendered items ever', () => {
            const collection = makeCollection();

            const items = [];
            for (let i = 0; i < 10; i++) {
                items.push(makeHideItem());
            }

            collection._$count = items.length;
            collection.at = (index) => items[index];

            VirtualScrollHideController.setup(collection);
            VirtualScrollHideController.setIndices(collection, 5, 8);
            VirtualScrollHideController.setIndices(collection, 1, 3);

            const enumerator = makeEnumerator();
            enumerator.moveNext = () => {
                enumerator._$position++;
                return enumerator._$position < 10;
            };
            enumerator.getCurrent = () => items[enumerator._$position];

            collection.getEnumerator = () => enumerator;

            const iteratedIndices = [];
            VirtualScrollHideController.each(collection, (_item, index) => iteratedIndices.push(index));

            assert.deepEqual(iteratedIndices, [1, 2, 5, 6, 7]);
        });
    });

    describe('isItemAtIndexHidden()', () => {
        it('returns true if item is hidden', () => {
            const collection = makeCollection();

            collection._$viewIterator = {
                data: {
                    startIndex: 10,
                    stopIndex: 25
                }
            };

            assert.isTrue(VirtualScrollHideController.isItemAtIndexHidden(collection, 5),
                'item before startIndex should not be visible');
            assert.isTrue(VirtualScrollHideController.isItemAtIndexHidden(collection, 30),
                'item after stopIndex should not be visible');
            assert.isFalse(VirtualScrollHideController.isItemAtIndexHidden(collection, 17));

            assert.isFalse(VirtualScrollHideController.isItemAtIndexHidden(collection, 10),
                'item at startIndex should be visible');
            assert.isTrue(VirtualScrollHideController.isItemAtIndexHidden(collection, 25),
                'item at stopIndex should not be visible');

            collection.at(0).isSticked = () => true;
            collection.at(5).isSticked = () => true;
            collection.at(30).isSticked = () => true;
            collection.at(35).isSticked = () => true;

            // Ближние к границам диапазона застиканные записи должны быть видны.
            assert.isFalse(VirtualScrollHideController.isItemAtIndexHidden(collection, 5));
            assert.isFalse(VirtualScrollHideController.isItemAtIndexHidden(collection, 30));

            assert.isTrue(VirtualScrollHideController.isItemAtIndexHidden(collection, 0));
            assert.isTrue(VirtualScrollHideController.isItemAtIndexHidden(collection, 35));
        });
    });
});
