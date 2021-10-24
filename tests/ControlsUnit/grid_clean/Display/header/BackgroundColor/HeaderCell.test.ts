import { Model } from 'Types/entity';
import { GridHeaderRow, GridHeaderCell, IColumn } from 'Controls/grid';
import { CssClassesAssert as cAssert } from '../../../../CustomAsserts';

describe('Controls/grid_clean/Display/header/BackgroundColor/HeaderCell', () => {
    let cell: GridHeaderCell<any>;
    let column: IColumn;
    const owner = {
        getHoverBackgroundStyle: () => 'default',
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
        isMultiline: () => false,
        getColumnsCount: () => 1,
        getActionsTemplateConfig: () => {/* FIXME: sinon mock */},
        hasItemActionsSeparatedCell: () => {/* FIXME: sinon mock */},
        getMultiSelectVisibility: () => 'hidden',
        isStickyHeader: () => true,
        getGridColumnsConfig: () => ([column]),
        getHeaderConfig: () => ([column]),
        hasColumnScroll: () => false
    } as undefined as GridHeaderRow<Model>;

    beforeEach(() => {
        cell = null;
        column = { width: ''};
    });

    describe('backgroundColorStyle has the highest priority', () => {

        // + backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'red', theme: 'default', style: 'master' });
            cAssert.include(cell.getWrapperClasses( 'blue'),
                'controls-background-blue');
            cAssert.notInclude(cell.getWrapperClasses('blue'),
                ['controls-background-default', 'controls-background-master', 'controls-background-red']);
        });

        // + backgroundStyle!=default
        // - style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, -style!=default, +backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'red', theme: 'default' });
            cAssert.include(cell.getWrapperClasses( 'blue'),
                'controls-background-blue');
            cAssert.notInclude(cell.getWrapperClasses( 'blue'),
                ['controls-background-default', 'controls-background-red']);
        });

        // - backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('-backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, theme: 'default', style: 'master' });
            cAssert.include(cell.getWrapperClasses( 'blue'),
                'controls-background-blue');
            cAssert.notInclude(cell.getWrapperClasses('blue'),
                ['controls-background-default', 'controls-background-master']);
        });

        // + style=default
        // + backgroundStyle=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle=default, +style=default, +backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'default', theme: 'default', style: 'default' });
            cAssert.include(cell.getWrapperClasses( 'blue'),
                'controls-background-blue');
            cAssert.notInclude(cell.getWrapperClasses('blue'),
                ['controls-background-default']);
        });
    });

    describe('backgroundStyle has higher priority than style', () => {
        // + backgroundStyle!=default
        // + style!=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle!=default, +style!=default, -backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'red', theme: 'default', style: 'master' });
            cAssert.include(cell.getWrapperClasses(undefined),
                'controls-background-red');
            cAssert.notInclude(cell.getWrapperClasses(undefined),
                ['controls-background-default', 'controls-background-master']);
        });

        // + backgroundStyle!=default
        // + style=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle!=default, +style=default, -backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'red', theme: 'default', style: 'default' });
            cAssert.include(cell.getWrapperClasses(undefined),
                'controls-background-red');
            cAssert.notInclude(cell.getWrapperClasses(undefined),
                ['controls-background-default']);
        });
    });

    describe('NON-default style has higher priority than backgroundStyle=default', () => {
        // + backgroundStyle=default
        // + style=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle=default, +style=default, -backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'default', theme: 'default', style: 'default' });
            cAssert.include(cell.getWrapperClasses(undefined),
                'controls-background-default');
        });

        // + backgroundStyle=default
        // + style!=default
        // - backgroundColorStyle
        // = style
        it('+backgroundStyle=default, +style=!default, -backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'default', theme: 'default', style: 'master' });
            cAssert.include(cell.getWrapperClasses(undefined),
                'controls-background-master');
            cAssert.notInclude(cell.getWrapperClasses(undefined),
                ['controls-background-default']);
        });
    });
});
