import { assert } from 'chai';
import { GridHeaderCell } from 'Controls/grid';
import {CssClassesAssert as cAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/grid_clean/Display/HeaderCell', () => {
    describe('Controls/grid_clean/Display/HeaderCell/getColspanStyles', () => {
        it('checkbox cell', () => {
            const cell = new GridHeaderCell({
                column: {},
                owner: {
                    hasMultiSelectColumn: () => true,
                    getHeaderConfig: () => [{}, {}],
                    isFullGridSupport: () => true
                }
            });
            assert.equal(cell.getColspanStyles(), 'grid-column: 1 / 2;');
        });
    });

    describe('Controls/grid_clean/Display/HeaderCell/getWrapperClasses', () => {
        let hasColumnScroll;
        let columnScrollViewMode;

        const headerConfig = [{}, {}];
        const columnsConfig = [{}, {}];
        const cell = new GridHeaderCell({
            column: headerConfig[1],
            owner: {
                hasMultiSelectColumn: () => false,
                getHeaderConfig: () => headerConfig,
                isFullGridSupport: () => true,
                hasColumnScroll: () => hasColumnScroll,
                getColumnScrollViewMode: () => columnScrollViewMode,
                getLeftPadding: () => 'default',
                getRightPadding: () => 'default',
                getColumnIndex: () => 1,
                isMultiline: () => false,
                getColumnsCount: () => 2,
                hasItemActionsSeparatedCell: () => false,
                isStickyHeader: () => false,
                getGridColumnsConfig: () => columnsConfig,
                getMultiSelectVisibility: () => 'hidden'
            }
        });

        it('without column scroll', () => {
            hasColumnScroll = false;
            cAssert.include(cell.getWrapperClasses(), 'controls-Grid__header-cell_min-width');
        });

        it('with column scroll', () => {
            hasColumnScroll = true;
            cAssert.notInclude(cell.getWrapperClasses(), 'controls-Grid__header-cell_min-width');
        });

        it('with column scroll and arrows scroll mode', () => {
            hasColumnScroll = true;
            columnScrollViewMode = 'arrows';
            cAssert.include(cell.getWrapperClasses(), 'controls-Grid__header-cell_withColumnScrollArrows');
        });
    });
});
