import { assert } from 'chai';
import TreeGridNodeExtraItemCell from 'Controls/_treeGrid/display/TreeGridNodeExtraItemCell';

describe('Controls/_treeGrid/display/TreeGridNodeExtraItemCell', () => {
    let mockedOwner;

    beforeEach(() => {
        mockedOwner = {
            getHoverBackgroundStyle: () => 'default',
            isDragged: () => false,
            hasItemActionsSeparatedCell: () => false,
            getTopPadding: () => 'default',
            getBottomPadding: () => 'default',
            getLeftPadding: () => 'default',
            getRightPadding: () => 'default',
            getEditingConfig: () => ({
                mode: 'cell'
            }),
            getColumnIndex: () => 0,
            getColumnsCount: () => 1,
            getMultiSelectVisibility: () => 'hidden',
            getGridColumnsConfig: () => [1],
            getStickyColumnsCount: () => 0,
            hasMultiSelectColumn: () => false,
            isFullGridSupport: () => true,
            hasColumnScroll: () => false,
            isMarked: () => false
        };
    });

});
