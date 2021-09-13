import { createSandbox } from 'sinon';
import { Model } from 'Types/entity';
import { GridHeader, GridHeaderRow, IGridHeaderRowOptions, GridCollection, GridCell, GridRow } from 'Controls/grid';

import {assert} from "chai";

describe('Controls/grid_clean/Display/header/HeaderRow', () => {
    const columns = [{ width: '1px' }];
    const owner = {
        getStickyColumnsCount: () => 1,
        getGridColumnsConfig: () => columns,
        hasMultiSelectColumn: () => true,
        hasItemActionsSeparatedCell: () => false
    } as undefined as GridCollection<Model>;

    const headerModel = {
        isMultiline: () => false,
        getBounds: () => ({
            column: {
                start: 1,
                end: 2
            },
            row: {
                start: 1,
                end: 2
            }
        })
    } as undefined as GridHeader<Model>;

    describe('_initializeColumns', () => {
        it('should call columnFactory with correct params', () => {

            const sandBox = createSandbox();

            function MockedFactory(): (options: any) => GridCell<any, any> {
                return (options) => {
                    const checkboxStandardOptions = {
                        backgroundStyle: 'custom',
                        column: {
                            endColumn: 2,
                            endRow: 2,
                            startColumn: 1,
                            startRow: 1
                        },
                        isFixed: true,
                        shadowVisibility: 'lastVisible'
                    };
                    const standardOptions = {
                        column: columns[0],
                        isFixed: true,
                        sorting: undefined,
                        cellPadding: undefined,
                        backgroundStyle: 'custom',
                        columnSeparatorSize: null,
                        shadowVisibility: 'lastVisible'
                    };

                    // assertion here
                    if (columns.includes(options.column)) {
                        assert.deepEqual(options, standardOptions);
                    } else {
                        assert.deepEqual(options, checkboxStandardOptions);
                    }

                    return {} as undefined as GridCell<any, GridRow<any>>;
                };
            }

            const row = new GridHeaderRow({
                header: [ { } ],
                columns,
                headerModel,
                owner,
                backgroundStyle: 'custom',
                columnsConfig: columns,
                gridColumnsConfig: columns.slice(),
                style: 'default'
            } as undefined as IGridHeaderRowOptions<any>);

            const stubMockedFactory = sandBox.stub(row, 'getColumnsFactory');
            stubMockedFactory.callsFake(MockedFactory);

            row.getColumns();

            // assertion inside MockedFactory above

            // check call for column and for checkboxColumn
            sandBox.assert.calledTwice(stubMockedFactory);

            sandBox.restore();
        });
    });
});
