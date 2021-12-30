import {assert} from 'chai';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';
import {GridItemActionsCell} from 'Controls/grid';
import {DRAG_SCROLL_JS_SELECTORS} from 'Controls/columnScroll';

describe('Controls/grid_clean/Display/ItemActionsCell', () => {
    it('getWrapperStyles', () => {
        const cell = new GridItemActionsCell({
            column: {},
            rowspan: 2,
            owner: {
                isFullGridSupport: () => true
            }
        });
        assert.equal(cell.getWrapperStyles(),
            'width: 0px; min-width: 0px; max-width: 0px; padding: 0px; z-index: 2; grid-row: 1 / 3;');
    });

    it('getWrapperClasses', () => {
        const owner = {
            isFullGridSupport: () => false,
            DisplayItemActions: true,
            hasColumnScroll: () => false,
            getHoverBackgroundStyle: () => '',
            getEditingBackgroundStyle: () => '',
            getTopPadding: () => '',
            getBottomPadding: () => '',
            getEditingConfig: () => ({}),
            isDragged: () => false,
            isMarked: () => false,
            isActive: () => false,
            hasMultiSelectColumn: () => false,
            getColumnIndex: () => 0,
            isSticked: () => false
        };
        const cell = new GridItemActionsCell({
            column: {},
            rowspan: 2,
            owner
        });

        owner.isFullGridSupport = () => true;
        CssClassesAssert.include(cell.getWrapperClasses(), DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE);

        owner.isFullGridSupport = () => false;
        CssClassesAssert.include(cell.getWrapperClasses(), DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE);
    });
});
