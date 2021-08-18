import GridViewTable from 'Controls/_grid/GridViewTable';
import {CssClassesAssert as assertClasses} from 'ControlsUnit/CustomAsserts';
import {assert} from 'chai';

describe('Controls/grid_clean/GridViewTable', () => {

    const listModel = {
        isDragging: () => false
    };

    let gridView: typeof GridViewTable;
    let options;

    beforeEach(() => {
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
        listModel.getGridColumnsConfig = () => ([{width: '20px'}, {width: 'auto'}]);
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
            ['max-content', '20px', 'auto', '0px']
        );
    });
});
