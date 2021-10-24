import {isSizeAffectsOptionsChanged} from 'Controls/_grid/ViewMixins/ColumnScrollViewMixin';
import {RecordSet} from 'Types/collection';
import {assert} from 'chai';

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
});
