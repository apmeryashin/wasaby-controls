import {ColumnScrollViewMixin, isSizeAffectsOptionsChanged, destroyColumnScroll} from 'Controls/_grid/ViewMixins/ColumnScrollViewMixin';
import {RecordSet} from 'Types/collection';
import {assert} from 'chai';
import {Control} from 'UI/Base';

describe('Controls/grid_clean/Display/ColumnScrollViewMixin', () => {
    describe('isSizeAffectsOptionsChanged', () => {
        it('items updated', () => {
            const oldItems = new RecordSet({keyProperty: '', rawData: []});
            const newItems = new RecordSet({keyProperty: '', rawData: [{}]});

            assert.isFalse(isSizeAffectsOptionsChanged({items: oldItems}, {items: oldItems}));
            assert.isTrue(isSizeAffectsOptionsChanged({items: oldItems}, {items: newItems}));
        });

        it('expanded items updated', () => {
            const oldExpandedItems = [1];
            const newExpandedItems = [1, 2];
            assert.isFalse(
                isSizeAffectsOptionsChanged({expandedItems: oldExpandedItems}, {expandedItems: oldExpandedItems})
            );
            assert.isTrue(
                isSizeAffectsOptionsChanged({expandedItems: oldExpandedItems}, {expandedItems: newExpandedItems})
            );
        });
    });

    describe('destroy scroll controller', () => {
        it('update sizes in scrollBar', () => {
            let wasUdated = false;
            const mixedView = {
                _$columnScrollController: {
                    destroy: () => {/* MOCK */}
                },
                _children: {
                    horizontalScrollBar: {
                        setSizes: (sizes) => {
                            wasUdated = true;
                            assert.deepEqual(sizes, {scrollWidth: 0});
                        }
                    }
                },
                _notify: () => {/* MOCK */}
            };
            destroyColumnScroll(mixedView);
            assert.isTrue(wasUdated);
        });
    });

    describe('_beforeUpdate', () => {
        it('remove max-width from content if column scroll was disabled by options', () => {
            const view = {
                _options: {},
                _$columnScrollEmptyViewMaxWidth: 350
            };

            ColumnScrollViewMixin._columnScrollOnViewBeforeUpdate.apply(view, [
                {columnScroll: false}
            ]);
            assert.isNull(view._$columnScrollEmptyViewMaxWidth);
        });
    });

    describe('_didUpdate', () => {
        it('should not force update if scroll is disabled', () => {
            const View = Control.extend([ColumnScrollViewMixin], {
                _forceUpdate: () => {
                    throw Error('_forceUpdate should not be called!');
                }
            });
            const mixedView = new View();

            assert.doesNotThrow(() => {
                mixedView._columnScrollOnViewDidUpdate({});
            });
        });
    });
});
