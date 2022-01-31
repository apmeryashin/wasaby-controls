import { assert } from 'chai';
import { GridDataCell, GridDataRow } from 'Controls/grid';
import {CssClassesAssert as cAssert} from './../../CustomAsserts';
import CheckboxCell from 'Controls/_grid/display/CheckboxCell';

describe('Controls/grid_clean/Display/DataCell', () => {
    describe('getWrapperClasses', () => {
        const mockedOwner = {
            getHoverBackgroundStyle: () => 'default',
            isDragged: () => false,
            hasItemActionsSeparatedCell: () => false,
            getTopPadding: () => 'default',
            getBottomPadding: () => 'default',
            getLeftPadding: () => 'default',
            getRightPadding: () => 'default',
            getEditingConfig: () => ({}),
            isFullGridSupport: () => true,
            getColumnIndex: () => 0,
            getColumnsCount: () => 0,
            getMultiSelectVisibility: () => 'hidden',
            hasColumnScroll: () => true,
            isEditing: () => false,
            getEditingBackgroundStyle: () => 'default',
            isActive: () => true,
            isSticked: () => false,
            hasMultiSelectColumn: () => false,
            shouldDisplayMarker: () => false,
            _getItemSpacingClasses: () => ''
        };

        it('should add background-color class', () => {
            const cell = new CheckboxCell({
                owner: {
                    ...mockedOwner
                },
                column: {displayProperty: 'key'},
                theme: 'default',
                style: 'default'
            });
            cAssert.include(
                cell.getWrapperClasses( null,  true),
                [
                    'controls-background-default'
                ]
            );
        });
    });
});
