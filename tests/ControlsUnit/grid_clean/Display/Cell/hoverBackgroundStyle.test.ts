import { Model } from 'Types/entity';
import { GridRow, GridCell } from 'Controls/grid';
import { CssClassesAssert as cAssert } from '../../../CustomAsserts';

describe('Controls/grid/Display/Cell/background/hoverBackgroundStyle', () => {
    let cell: GridCell<Model, GridRow<Model>>;
    let hoverBackgroundStyle: string;
    const owner = {
        getHoverBackgroundStyle: () => hoverBackgroundStyle,
        getTopPadding: () => 'default',
        getBottomPadding: () => 'default',
        getLeftPadding: () => 'default',
        getRightPadding: () => 'default',
        isDragged: () => false,
        getEditingBackgroundStyle: () => 'default',
        isActive: () => false,
        getRowSeparatorSize: () => 's',
        hasMultiSelectColumn: () => false,
        getColumnIndex: () => 1,
        getFadedClass: () => '',

        // methods for contentClasses
        getColumnsCount: () => 1,
        getMultiSelectVisibility: () => 'hidden',
        hasItemActionsSeparatedCell: () => false,
        getStickyLadder: () => false,

        // owner methods for _getBackgroundColorWrapperClasses
        getEditingConfig: () => undefined,

        // This setting changes behavior
        isEditing: () => false,
        hasColumnScroll: () => false,
        isMarked: () => false,
        isSticked: () => false
    } as undefined as GridRow<Model>;

    beforeEach(() => {
        cell = null;
        hoverBackgroundStyle = 'default';
    });

    describe('getWrapperClasses', () => {

        it('templateHighlightOnHover=false', () => {
            cell = new GridCell({ owner, column: { width: ''}, theme: 'default', style: 'default' });
            cAssert.notInclude(cell.getWrapperClasses(undefined, false),
                'controls-Grid__row-cell-background-hover-default');
        });

        it('-templateHoverBackgroundStyle, +hoverBackgroundStyle', () => {
            cell = new GridCell({ owner, column: { width: ''}, theme: 'default', style: 'default' });
            cAssert.include(cell.getWrapperClasses(undefined, true),
                'controls-Grid__row-cell-background-hover-default');
        });

        it('+templateHoverBackgroundStyle, +hoverBackgroundStyle', () => {
            cell = new GridCell({ owner, column: { width: ''}, theme: 'default', style: 'default' });
            cAssert.include(cell.getWrapperClasses(undefined, true, 'custom'),
                'controls-Grid__row-cell-background-hover-custom');
        });

        it('column.hoverBackgroundStyle=transparent', () => {
            cell = new GridCell({
                owner,
                column: {width: '', hoverBackgroundStyle: 'transparent'},
                theme: 'default',
                style: 'default'
            });
            cAssert.notInclude(cell.getWrapperClasses(undefined, true),
                'controls-Grid__row-cell-background-hover-default');
        });
    });

    describe('getContentClasses', () => {

        // Если на шаблоне выключен ховер для всей строки, то нет смысла подсвечивать какую-то одну
        it('templateHighlightOnHover=false, column.hoverBackgroundStyle=custom', () => {
            cell = new GridCell({ owner, column: { width: '', hoverBackgroundStyle: 'custom'} });
            cAssert.notInclude(cell.getContentClasses( undefined, 'default', false),
                'controls-Grid__item_background-hover_custom');
        });

        it('templateHighlightOnHover=true, column.hoverBackgroundStyle=custom', () => {
            cell = new GridCell({ owner, column: { width: '', hoverBackgroundStyle: 'custom'} });
            cAssert.include(cell.getContentClasses(undefined, 'default', true),
                'controls-Grid__item_background-hover_custom');
        });

        it('templateHighlightOnHover=true, column.hoverBackgroundStyle=transparent', () => {
            cell = new GridCell({ owner, column: { width: '', hoverBackgroundStyle: 'transparent'} });
            cAssert.notInclude(cell.getContentClasses( undefined, 'default', true),
                'controls-Grid__item_background-hover_default');
        });

        it('templateHighlightOnHover=true, column.hoverBackgroundStyle not defined', () => {
            cell = new GridCell({ owner, column: { width: ''} });
            cAssert.include(cell.getContentClasses(undefined, 'default', true),
                'controls-Grid__item_background-hover_default');
        });

        // Если на шаблоне выключен ховер для всей строки, то нет смысла подсвечивать какую-то одну
        // tslint:disable-next-line:max-line-length
        it('templateHighlightOnHover=false, templateHoverBackgroundStyle=custom2, column.hoverBackgroundStyle=custom', () => {
            cell = new GridCell({ owner, column: { width: '', hoverBackgroundStyle: 'custom'} });
            cAssert.notInclude(cell.getContentClasses( undefined, 'default', false, true, 'custom2'),
                'controls-Grid__item_background-hover_custom');
        });

        // tslint:disable-next-line:max-line-length
        it('templateHighlightOnHover=true, templateHoverBackgroundStyle=custom2, column.hoverBackgroundStyle=custom', () => {
            cell = new GridCell({ owner, column: { width: '', hoverBackgroundStyle: 'custom'} });
            cAssert.include(cell.getContentClasses(undefined, 'default', true, true, 'custom2'),
                'controls-Grid__item_background-hover_custom');
        });

        it('templateHighlightOnHover=true, templateHoverBackgroundStyle=custom2, column.hoverBackgroundStyle=transparent', () => {
            cell = new GridCell({ owner, column: { width: '', hoverBackgroundStyle: 'transparent'} });
            cAssert.notInclude(cell.getContentClasses( undefined, 'default', true, true, 'custom2'),
                'controls-Grid__item_background-hover_default');
        });

        it('templateHighlightOnHover=true, templateHoverBackgroundStyle=custom2, column.hoverBackgroundStyle not defined', () => {
            cell = new GridCell({ owner, column: { width: ''} });
            cAssert.include(cell.getContentClasses(undefined, 'default', true, true, 'custom2'),
                'controls-Grid__item_background-hover_custom2');
        });
    });
});
