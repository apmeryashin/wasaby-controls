import GridViewTable from 'Controls/_grid/GridViewTable';
import {CssClassesAssert as assertClasses} from 'ControlsUnit/CustomAsserts';
import {assert} from 'chai';

describe('Controls/grid_clean/GridViewTable', () => {

    let columns = [];

    const listModel = {
        isDragging: () => false,
        getColumnsEnumerator: () => ({ getColumns: () => columns }),
        getGridColumnsConfig: () => columns
    };

    let gridView: typeof GridViewTable;
    let options;

    beforeEach(() => {
        columns = [];
        options = {};
    });

    it('_getGridViewClasses', () => {
        gridView = new GridViewTable(options);
        gridView._listModel = listModel;
        assertClasses.include(
            gridView._getGridViewClasses(options),
            'controls-Grid_table-layout controls-Grid_table-layout_fixed'
        );
    });

    it('_getGridTemplateColumnsWidth', () => {
        gridView = new GridViewTable(options);
        columns = [{width: '20px'}, {width: 'auto'}];
        gridView._listModel = listModel;
        options = {
            ...options,
            columns: listModel.getGridColumnsConfig(),
            multiSelectVisibility: 'visible',
            isFullGridSupport: false,
            stickyColumn: {},
            columnScroll: true,
            itemActionsPosition: 'inside'
        };

        assert.deepEqual(
            gridView._getGridTemplateColumnsWidth(options),
            ['max-content', '20px', 'auto']
        );
    });
});
