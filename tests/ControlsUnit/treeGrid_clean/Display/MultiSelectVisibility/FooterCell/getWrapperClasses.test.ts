import { assert } from 'chai';
import { TreeGridFooterCell } from 'Controls/treeGrid';
import { createRegExpForTestMatchClass } from 'ControlsUnit/_unitUtils/RegExp';

describe('Controls/treeGrid_clean/Display/MultiSelectVisibility/FooterCell/getWrapperClasses', () => {

    it('hasMultiSelectColumn() returns false, check first cell', () => {
        const mockedOwner = {
            getGridColumnsConfig: () => [{}],
            getColumnsCount: () => 1,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getExpanderIcon: () => '',
            getExpanderPosition: () => 'default',
            getExpanderVisibility: () => 'hasChildren',
            getActionsTemplateConfig: ()=> {/* FIXME: sinon mock */},
            hasMultiSelectColumn: () => false,
            getMultiSelectVisibility: () => 'hidden',
            hasColumnScroll: () => false,
            getLeftPadding: () => '',
            getRightPadding: () => '',
            hasItemActionsSeparatedCell: () => false,
            getColumnIndex: () => 0,
            isFullGridSupport: () => true
        } as any;

        const footerCell = new TreeGridFooterCell({
            owner: mockedOwner,
            column: {}
        });
        assert.match(
            footerCell.getWrapperClasses('mockedBG', false),
            createRegExpForTestMatchClass('controls-TreeGridView__expanderPadding'));
    });

    it('hasMultiSelectColumn() returns true, check first cell (checkbox cell)', () => {
        const mockedOwner = {
            getGridColumnsConfig: () => [{}],
            getColumnsCount: () => 2,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getExpanderIcon: () => '',
            getExpanderPosition: () => 'default',
            getExpanderVisibility: () => 'hasChildren',
            getActionsTemplateConfig: ()=> {/* FIXME: sinon mock */},
            hasMultiSelectColumn: () => true,
            getMultiSelectVisibility: () => 'visible',
            hasColumnScroll: () => false,
            getLeftPadding: () => '',
            getRightPadding: () => '',
            hasItemActionsSeparatedCell: () => false,
            getColumnIndex: () => 0,
            isFullGridSupport: () => true
        } as any;

        const footerCell = new TreeGridFooterCell({
            owner: mockedOwner,
            column: {}
        });

        assert.notMatch(
            footerCell.getWrapperClasses('mockedBG',  false),
            createRegExpForTestMatchClass('controls-TreeGridView__expanderPadding'));
    });

    it('hasMultiSelectColumn() returns true, check second cell', () => {
        const mockedOwner = {
            getGridColumnsConfig: () => [{}],
            getColumnsCount: () => 2,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getExpanderIcon: () => '',
            getExpanderPosition: () => 'default',
            getExpanderVisibility: () => 'hasChildren',
            getActionsTemplateConfig: ()=> {/* FIXME: sinon mock */},
            hasMultiSelectColumn: () => true,
            getMultiSelectVisibility: () => 'visible',
            hasColumnScroll: () => false,
            getLeftPadding: () => '',
            getRightPadding: () => '',
            hasItemActionsSeparatedCell: () => false,
            getColumnIndex: () => 1,
            isFullGridSupport: () => true
        } as any;

        const footerCell = new TreeGridFooterCell({
            owner: mockedOwner,
            column: {}
        });

        assert.match(
            footerCell.getWrapperClasses('mockedBG',  false),
            createRegExpForTestMatchClass('controls-TreeGridView__expanderPadding'));
    });

});
