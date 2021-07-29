import { Model } from 'Types/entity';
import { GridFooterRow, GridFooterCell } from 'Controls/grid';
import { CssClassesAssert as cAssert } from '../../../../CustomAsserts';

describe('Controls/grid/Display/Footer/FooterCell/backgroundColorStyle', () => {
    let cell: GridFooterCell<any>;
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
        hasColumnScroll: () => false,
        getActionsTemplateConfig: () => {},
        getMultiSelectVisibility: () => 'hidden',
        getColumnsCount: () => 1,
        hasItemActionsSeparatedCell: () => {}
    } as undefined as GridFooterRow<Model>;

    beforeEach(() => {
        cell = null;
    });

    describe('backgroundColorStyle has the highest priority', () => {

        // + backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default', style: 'master' });
            cAssert.include(cell.getWrapperClasses('blue', false),
                'controls-background-blue');
            cAssert.notInclude(cell.getWrapperClasses('blue',  false),
                ['controls-background-default', 'controls-background-master', 'controls-background-red']);
        });

        // + backgroundStyle!=default
        // - style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, -style!=default, +backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default' });
            cAssert.include(cell.getWrapperClasses( 'blue', false),
                'controls-background-blue');
            cAssert.notInclude(cell.getWrapperClasses( 'blue', false),
                ['controls-background-default', 'controls-background-red']);
        });

        // - backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('-backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, theme: 'default', style: 'master' });
            cAssert.include(cell.getWrapperClasses( 'blue', false),
                'controls-background-blue');
            cAssert.notInclude(cell.getWrapperClasses( 'blue', false),
                ['controls-background-default', 'controls-background-master']);
        });

        // + style=default
        // + backgroundStyle=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle=default, +style=default, +backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'default', theme: 'default', style: 'default' });
            cAssert.include(cell.getWrapperClasses('blue',  false),
                'controls-background-blue');
            cAssert.notInclude(cell.getWrapperClasses( 'blue',  false),
                ['controls-background-default']);
        });
    });

    describe('backgroundStyle has higher priority than style', () => {
        // + backgroundStyle!=default
        // + style!=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle!=default, +style!=default, -backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default', style: 'master' });
            cAssert.include(cell.getWrapperClasses(undefined,  false),
                'controls-background-red');
            cAssert.notInclude(cell.getWrapperClasses( undefined,  false),
                ['controls-background-default', 'controls-background-master']);
        });

        // + backgroundStyle!=default
        // + style=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle!=default, +style=default, -backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default', style: 'default' });
            cAssert.include(cell.getWrapperClasses( undefined,  false),
                'controls-background-red');
            cAssert.notInclude(cell.getWrapperClasses( undefined,  false),
                ['controls-background-default']);
        });
    });

    describe('NON-default style has higher priority than backgroundStyle=default', () => {
        // + backgroundStyle=default
        // + style=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle=default, +style=default, -backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'default', theme: 'default', style: 'default' });
            cAssert.include(cell.getWrapperClasses( undefined,  false),
                'controls-background-default');
        });

        // + backgroundStyle=default
        // + style!=default
        // - backgroundColorStyle
        // = style
        it('+backgroundStyle=default, +style=!default, -backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'default', theme: 'default', style: 'master' });
            cAssert.include(cell.getWrapperClasses( undefined,  false),
                'controls-background-master');
            cAssert.notInclude(cell.getWrapperClasses( undefined,  false),
                ['controls-background-default']);
        });
    });
});
