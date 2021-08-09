import {assert} from 'chai';
import {GridResultsRow} from 'Controls/grid';

describe('Controls/grid/Display/Results/ResultsRow/getStickyHeaderPosition', () => {
    it('should be equal to "top" if results position is equal to "top"', () => {
        const row = new GridResultsRow({
            owner: {},
            resultsPosition: 'top'
        });

        assert.deepEqual(row.getStickyHeaderPosition(),  { vertical: 'top' });
    });

    it('should be equal to "bottom" if results position is equal to "bottom"', () => {
        const row = new GridResultsRow({
            owner: {},
            resultsPosition: 'bottom'
        });

        assert.deepEqual(row.getStickyHeaderPosition(),  { vertical: 'bottom' });
    });

    it('should be equal to "top" if results position is not setted"', () => {
        const row = new GridResultsRow({
            owner: {}
        });

        assert.deepEqual(row.getStickyHeaderPosition(), { vertical: 'top' });
    });
});
