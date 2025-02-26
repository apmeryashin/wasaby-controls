import { Model } from 'Types/entity';
import { GridRow, GridCell } from 'Controls/grid';
import { CssClassesAssert as cAssert } from '../../../CustomAsserts';

describe('Controls/grid/Display/Cell/backgroundColorStyle', () => {
    let hasColumnScroll: boolean;
    let cell: GridCell<Model, GridRow<Model>>;
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

        // owner methods for _getBackgroundColorWrapperClasses
        getEditingConfig: () => undefined,

        // This setting changes behavior
        isEditing: () => false,

        // This setting changes behavior
        hasColumnScroll: () => hasColumnScroll,
        isMarked: () => false,
        isSticked: () => false
    } as undefined as GridRow<Model>;

    beforeEach(() => {
        cell = null;
    });

    describe('not Editing, no ColumnScroll, not Sticked', () => {
        beforeEach(() => {
            cell = null;
            hasColumnScroll = false;
        });

        describe('backgroundColorStyle has the highest priority', () => {

            // + backgroundStyle!=default
            // + style!=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('+backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default', style: 'master' });
                cAssert.include(cell.getWrapperClasses('blue', false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses('blue', false),
                    ['controls-background-red', 'controls-background-blue', 'controls-background-default', 'controls-background-master']);
            });

            // + backgroundStyle!=default
            // - style!=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('+backgroundStyle!=default, -style!=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default' });
                cAssert.include(cell.getWrapperClasses('blue', false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses('blue', false),
                    ['controls-background-red', 'controls-background-blue', 'controls-background-default']);
            });

            // - backgroundStyle!=default
            // + style!=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('-backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, theme: 'default', style: 'master' });
                cAssert.include(cell.getWrapperClasses('blue', false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses('blue', false),
                    ['controls-background-blue', 'controls-background-default']);
            });

            // + style=default
            // + backgroundStyle=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('+backgroundStyle=default, +style=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', theme: 'default', style: 'default' });
                cAssert.include(cell.getWrapperClasses('blue', false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses('blue', false),
                    ['controls-background-blue', 'controls-background-default']);
            });
        });

        describe('Without ColumnScroll backgroundStyle and style does not affect cell backgroundColor', () => {

            beforeEach(() => {
                hasColumnScroll = false;
            });

            // + backgroundStyle!=default
            // + style!=default
            // - backgroundColorStyle
            // = none
            it('+backgroundStyle!=default, +style!=default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default', style: 'master' });
                cAssert.notInclude(cell.getWrapperClasses(undefined, false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-Grid__row-cell_background_master', 'controls-background-master',
                        'controls-background-default']);
            });

            // + backgroundStyle!=default
            // + style=default
            // - backgroundColorStyle
            // = none
            it('+backgroundStyle!=default, +style=default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default', style: 'default' });
                cAssert.notInclude(cell.getWrapperClasses(undefined, false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-background-default']);
            });

            // + backgroundStyle=default
            // + style=default
            // - backgroundColorStyle
            // = none
            it('+backgroundStyle=default, +style=default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', theme: 'default', style: 'default' });
                cAssert.notInclude(cell.getWrapperClasses( undefined, false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-background-default']);
            });

            // + backgroundStyle=default
            // + style!=default
            // - backgroundColorStyle
            // = none
            it('+backgroundStyle=default, +style=!default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', theme: 'default', style: 'master' });
                cAssert.notInclude(cell.getWrapperClasses(undefined, false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-Grid__row-cell_background_master', 'controls-background-master',
                        'controls-background-default']);
            });

            // - backgroundStyle=default
            // - style=default
            // - backgroundColorStyle
            // = none
            it('-backgroundStyle=default, -style=!default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, theme: 'default' });
                cAssert.notInclude(cell.getWrapperClasses(undefined, false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-Grid__row-cell_background_master', 'controls-background-master',
                        'controls-background-default']);
            });

            // - backgroundStyle=default
            // + style!=default
            // - backgroundColorStyle
            // = none
            it('-backgroundStyle=default, +style=!default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, theme: 'default', style: 'master' });
                cAssert.notInclude(cell.getWrapperClasses(undefined, false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-Grid__row-cell_background_master', 'controls-background-master',
                        'controls-background-default']);
            });
        });
    });

    describe('not Editing, with ColumnScroll, not Sticked', () => {

        beforeEach(() => {
            cell = null;
            hasColumnScroll = true;
        });

        describe('backgroundColorStyle has the highest priority', () => {

            // + backgroundStyle!=default
            // + style!=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('+backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default', style: 'master' });
                cAssert.include(cell.getWrapperClasses('blue', false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses('blue', false),
                    ['controls-background-red', 'controls-background-blue', 'controls-background-default']);
            });

            // + backgroundStyle!=default
            // - style!=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('+backgroundStyle!=default, -style!=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default' });
                cAssert.include(cell.getWrapperClasses( 'blue',  false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses( 'blue',  false),
                    ['controls-background-red', 'controls-background-blue', 'controls-background-default']);
            });

            // - backgroundStyle!=default
            // + style!=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('-backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, theme: 'default', style: 'master' });
                cAssert.include(cell.getWrapperClasses( 'blue',  false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses( 'blue',  false),
                    ['controls-background-blue', 'controls-background-default']);
            });

            // + style=default
            // + backgroundStyle=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('+backgroundStyle=default, +style=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', theme: 'default' });
                cAssert.include(cell.getWrapperClasses( 'blue',  false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses( 'blue',  false),
                    ['controls-background-blue', 'controls-background-default']);
            });
        });

        describe('backgroundStyle has higher priority than style', () => {
            // + backgroundStyle!=default
            // + style!=default
            // - backgroundColorStyle
            // = backgroundStyle
            it('+backgroundStyle!=default, +style!=default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default', style: 'master' });
                cAssert.include(cell.getWrapperClasses( undefined,  false),
                    ['controls-background-red']);

                cAssert.notInclude(cell.getWrapperClasses( undefined,  false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-Grid__row-cell_background_master']);
            });

            // + backgroundStyle!=default
            // + style=default
            // - backgroundColorStyle
            // = backgroundStyle
            it('+backgroundStyle!=default, +style=default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', theme: 'default', style: 'default' });
                cAssert.include(cell.getWrapperClasses( undefined,  false),
                    ['controls-background-red']);
                cAssert.notInclude(cell.getWrapperClasses( undefined,  false),
                    ['controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default']);
            });
        });

        describe('NON-default style has higher priority than backgroundStyle=default', () => {
            // + backgroundStyle=default
            // + style=default
            // - backgroundColorStyle
            // = backgroundStyle
            it('+backgroundStyle=default, +style=default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', theme: 'default', style: 'default' });
                cAssert.include(cell.getWrapperClasses( undefined,  false),
                    ['controls-background-default']);
                cAssert.notInclude(cell.getWrapperClasses( undefined,  false),
                    ['controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default']);
            });

            // + backgroundStyle=default
            // + style!=default
            // - backgroundColorStyle
            // = style
            it('+backgroundStyle=default, +style=!default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', theme: 'default', style: 'master' });
                cAssert.include(cell.getWrapperClasses( undefined, false),
                    ['controls-background-master']);
                cAssert.notInclude(cell.getWrapperClasses(undefined, false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-Grid__row-cell_background_master']);
            });
        });

        describe('use default if background style undefined', () => {
            // - backgroundStyle=null
            // + style=default
            // - backgroundColorStyle=undefined
            // + hasColumnScroll
            // = controls-background-default
            it('-backgroundStyle=default, +style=default, -backgroundColorStyle', () => {
                hasColumnScroll = true;
                cell = new GridCell({ owner, column: { width: '' }, backgroundStyle: null });
                cAssert.include(
                    cell.getWrapperClasses('default', undefined, 'default', false),
                    'controls-background-default'
                );
            });
        });
    });

    describe('not Editing, no ColumnScroll, isSticked', () => {

        beforeEach(() => {
            cell = null;
            hasColumnScroll = false;
        });

        describe('backgroundColorStyle has the highest priority', () => {

            // + backgroundStyle!=default
            // + style!=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('+backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', isSticked: true, theme: 'default', style: 'master' });
                cAssert.include(cell.getWrapperClasses( 'blue',  false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses( 'blue',  false),
                    ['controls-background-red', 'controls-background-blue', 'controls-background-default']);
            });

            // + backgroundStyle!=default
            // - style!=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('+backgroundStyle!=default, -style!=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', isSticked: true, theme: 'default' });
                cAssert.include(cell.getWrapperClasses( 'blue',  false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses( 'blue',  false),
                    ['controls-background-red', 'controls-background-blue', 'controls-background-default']);
            });

            // - backgroundStyle!=default
            // + style!=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('-backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
                cell = new GridCell({
                    owner,
                    column: {width: ''},
                    isSticked: true,
                    theme: 'default',
                    style: 'master'
                });
                cAssert.include(cell.getWrapperClasses( 'blue',  false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses( 'blue',  false),
                    ['controls-background-blue', 'controls-background-default']);
            });

            // + style=default
            // + backgroundStyle=default
            // + backgroundColorStyle
            // = backgroundColorStyle
            it('+backgroundStyle=default, +style=default, +backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', isSticked: true, theme: 'default', style: 'default' });
                cAssert.include(cell.getWrapperClasses( 'blue',  false),
                    'controls-Grid__row-cell_background_blue');
                cAssert.notInclude(cell.getWrapperClasses( 'blue',  false),
                    ['controls-background-blue', 'controls-background-default']);
            });
        });

        describe('backgroundStyle has higher priority than style', () => {
            // + backgroundStyle!=default
            // + style!=default
            // - backgroundColorStyle
            // = backgroundStyle
            it('+backgroundStyle!=default, +style!=default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', isSticked: true, theme: 'default', style: 'master' });
                cAssert.include(cell.getWrapperClasses( undefined,  false),
                    ['controls-background-red']);

                cAssert.notInclude(cell.getWrapperClasses( undefined,  false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-Grid__row-cell_background_master']);
            });

            // + backgroundStyle!=default
            // + style=default
            // - backgroundColorStyle
            // = backgroundStyle
            it('+backgroundStyle!=default, +style=default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', isSticked: true, theme: 'default', style: 'default' });
                cAssert.include(cell.getWrapperClasses( undefined,  false),
                    ['controls-background-red']);
                cAssert.notInclude(cell.getWrapperClasses( undefined,  false),
                    ['controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default']);
            });
        });

        describe('NON-default style has higher priority than backgroundStyle=default', () => {
            // + backgroundStyle=default
            // + style=default
            // - backgroundColorStyle
            // = backgroundStyle
            it('+backgroundStyle=default, +style=default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', isSticked: true, theme: 'default', style: 'default' });
                cAssert.include(cell.getWrapperClasses( undefined,  false),
                    ['controls-background-default']);
                cAssert.notInclude(cell.getWrapperClasses( undefined,  false),
                    ['controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default']);
            });

            // + backgroundStyle=default
            // + style!=default
            // - backgroundColorStyle
            // = style
            it('+backgroundStyle=default, +style=!default, -backgroundColorStyle', () => {
                cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', isSticked: true, theme: 'default', style: 'master' });
                cAssert.include(cell.getWrapperClasses(undefined,  false),
                    ['controls-background-master']);
                cAssert.notInclude(cell.getWrapperClasses(undefined,  false),
                    [
                        'controls-Grid__row-cell_background_undefined', 'controls-Grid__row-cell_background_default',
                        'controls-Grid__row-cell_background_master']);
            });
        });
    });
});
