import {assert} from 'chai';
import {GridResultsCell} from 'Controls/grid';

describe('Controls/grid/Display/Results/ResultsRow/getStickyHeaderPosition', () => {
    it('should be equal to "top" if results position is equal to "top"', () => {
        const row = new GridResultsCell({
            owner: {
                isSticked: () => true,
                hasNewColumnScroll: () => false
            },
            resultsPosition: 'top'
        });

        assert.deepEqual(row.getStickyHeaderPosition(),  { vertical: 'top' });
    });

    it('should be equal to "bottom" if results position is equal to "bottom"', () => {
        const row = new GridResultsCell({
            owner: {
                isSticked: () => true,
                hasNewColumnScroll: () => false
            },
            resultsPosition: 'bottom'
        });

        assert.deepEqual(row.getStickyHeaderPosition(),  { vertical: 'bottom' });
    });

    it('should be equal to "top" if results position is not setted"', () => {
        const row = new GridResultsCell({
            owner: {
                isSticked: () => true,
                hasNewColumnScroll: () => false
            }
        });

        assert.deepEqual(row.getStickyHeaderPosition(), { vertical: 'top' });
    });
});
