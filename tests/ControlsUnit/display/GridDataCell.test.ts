import { assert } from 'chai';
import { Model as EntityModel, Model } from 'Types/entity';

import { GridCollection, GridDataCell, GridDataRow, TColspanCallback } from 'Controls/grid';
import { IColumn } from 'Controls/grid';

describe('Controls/display/GridDataCell', () => {
    let owner: GridDataRow<Model>;
    let cell: GridDataCell<Model, GridDataRow<Model>>;
    let multiSelectVisibility: string;
    let columnIndex: number;
    let columnsCount: number;
    let column: IColumn;
    let editArrowIsVisible: boolean;

    function initCell(): GridDataCell<Model, GridDataRow<Model>> {
        cell = new GridDataCell<Model, GridDataRow<Model>>({
            owner,
            column
        });
        return cell;
    }

    beforeEach(() => {
        column = {
            width: '1px'
        };
        multiSelectVisibility = 'hidden';
        columnIndex = 0;
        columnsCount = 4;
        editArrowIsVisible = false;
        owner = {
            getColumnIndex(): number {
                return columnIndex;
            },
            hasMultiSelectColumn(): boolean {
                return multiSelectVisibility === 'visible';
            },
            editArrowIsVisible(): boolean {
                return editArrowIsVisible;
            },
            getContents(): Model {
                return {} as undefined as Model;
            }
        } as Partial<GridDataRow<Model>> as undefined as GridDataRow<Model>;
    });

    // region Аспект "Кнопка редактирования"

    describe('shouldDisplayEditArrow', () => {
        it('should return true for columnIndex===0', () => {
            editArrowIsVisible = true;
            columnIndex = 0;
            assert.isTrue(initCell().shouldDisplayEditArrow());
        });
        it('should return true for columnIndex===1, when multiSelect', () => {
            editArrowIsVisible = true;
            multiSelectVisibility = 'visible';
            columnIndex = 1;
            assert.isTrue(initCell().shouldDisplayEditArrow());
        });
        it('should not return true for columnIndex===1, when no multiSelect', () => {
            editArrowIsVisible = true;
            columnIndex = 1;
            assert.isFalse(initCell().shouldDisplayEditArrow());
        });
        it('should not return true when custom contentTemplate is set', () => {
            editArrowIsVisible = true;
            assert.isFalse(initCell().shouldDisplayEditArrow(() => ''));
        });
    });

    // endregion

    describe('ColumnSeparatorSize', () => {
        let columns: IColumn[];
        let hasMultiSelectColumn: boolean;
        let stickyColumnsCount: number;
        let hasItemActionsSeparatedCell: boolean;
        let hasColumnScroll: boolean;

        function getGridRow(): GridDataRow<Model> {
            const owner: GridCollection<Model> = {
                hasMultiSelectColumn: () => hasMultiSelectColumn,
                getStickyColumnsCount: () => stickyColumnsCount,
                getGridColumnsConfig: () => columns,
                hasItemActionsSeparatedCell: () => hasItemActionsSeparatedCell,
                hasColumnScroll: () => hasColumnScroll,
                getHoverBackgroundStyle: () => 'default',
                getTopPadding: () => 'null',
                getBottomPadding: () => 'null',
                isEditing: () => false,
                isDragging: () => false,
                getEditingBackgroundStyle: () => 'default',
                isActive: () => false,
                getRowSeparatorSize: () => 's',
                getEditingConfig: () => ({}),
                getItemEditorTemplate: () => {/* FIXME: sinon mock */},
                isFullGridSupport: () => true
            } as undefined as GridCollection<Model>;
            return new GridDataRow({
                gridColumnsConfig: columns,
                columnsConfig: columns,
                owner,
                contents: {
                    getKey: () => 1
                },
                colspanCallback: ((item: EntityModel, column: IColumn, columnIndex: number, isEditing: boolean) => {
                    return null; // number | 'end'
                }) as TColspanCallback
            });
        }

        beforeEach(() => {
            hasMultiSelectColumn = false;
            stickyColumnsCount = 0;
            hasItemActionsSeparatedCell = false;
            hasColumnScroll = false;
            columns = [{ width: '1px'}, { width: '1px'}, { width: '1px'}, { width: '1px'}];
        });

        it('should add columnSeparatorSize based on grid\'s columnSeparatorSize', () => {
            const row = getGridRow();
            row.setColumnSeparatorSize('s');
            cell = row.getColumns()[1] as GridDataCell<Model, GridDataRow<Model>>;
            const wrapperClasses = cell.getWrapperClasses('default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s');
        });

        it('should add columnSeparatorSize based on current column\'s left columnSeparatorSize', () => {
            columns[1].columnSeparatorSize = {left: 's', right: null};
            const row = getGridRow();
            cell = row.getColumns()[1] as GridDataCell<Model, GridDataRow<Model>>;
            const wrapperClasses = cell.getWrapperClasses( 'default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s');
        });

        it('should add columnSeparatorSize based on previous column\'s right columnSeparatorSize config', () => {
            columns[1].columnSeparatorSize = {left: null, right: 's'};
            const row = getGridRow();
            let wrapperClasses: string;
            cell = row.getColumns()[1] as GridDataCell<Model, GridDataRow<Model>>;
            wrapperClasses = cell.getWrapperClasses('default', true);
            assert.notInclude(wrapperClasses, 'controls-Grid__columnSeparator_size-s');

            cell = row.getColumns()[2] as GridDataCell<Model, GridDataRow<Model>>;
            wrapperClasses = cell.getWrapperClasses('default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s');
        });

        it('should add columnSeparatorSize based on grid\'s columnSeparatorSize when multiSelect', () => {
            hasMultiSelectColumn = true;
            const row = getGridRow();
            row.setColumnSeparatorSize('s');
            cell = row.getColumns()[2] as GridDataCell<Model, GridDataRow<Model>>;
            const wrapperClasses = cell.getWrapperClasses('default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s');
        });

        it('should add columnSeparatorSize based on current column config when multiSelect', () => {
            hasMultiSelectColumn = true;
            columns[1].columnSeparatorSize = {left: 's', right: null};
            const row = getGridRow();
            cell = row.getColumns()[2] as GridDataCell<Model, GridDataRow<Model>>;
            const wrapperClasses = cell.getWrapperClasses('default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s');
        });

    });
});
