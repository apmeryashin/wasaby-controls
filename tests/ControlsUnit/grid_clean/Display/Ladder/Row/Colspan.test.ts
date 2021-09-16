import { assert } from 'chai';
import { GridDataRow, GridCollection } from 'Controls/grid';
import { Model } from 'Types/entity';

const mockedCollection = {
    getStickyColumnsCount: () => 2,
    hasMultiSelectColumn: () => false,
    hasItemActionsSeparatedCell: () => false,
    getIndex: () => 0,
    notifyItemChange: () => {},
    getItemEditorTemplate: () => {},
    isFullGridSupport: () => true,
    hasColumnScroll: () => false
} as GridCollection<Model>;

describe('Controls/grid_clean/Display/Ladder/Row/Colspan', () => {

    describe('getColumns', () => {
        let record: Model;

        beforeEach(() => {
            record = new Model({
                rawData: { key: 1, title: 'first'},
                keyProperty: 'key'
            });
        });

        afterEach(() => {
            record = undefined;
        });

        it('without Colspan', () => {
            const columnsConfig = [
                {
                    displayProperty: 'first',
                    stickyProperty: ['prop1', 'prop2']
                },
                {
                    displayProperty: 'second'
                }
            ];
            const gridRow = new GridDataRow({
                owner: {
                    ...mockedCollection,
                    getGridColumnsConfig: () => columnsConfig
                },
                columnsConfig: columnsConfig,
                stickyLadder: {
                    'prop1': {headingStyle: 'style'},
                    'prop2': {headingStyle: 'style'}
                },
                gridColumnsConfig: columnsConfig,
                contents: record
            });

            gridRow.updateLadder({}, { prop1: { headingStyle: 'style'}, prop2: {headingStyle: 'style'}});
            assert.isArray(gridRow.getColumns());
            assert.equal(gridRow.getColumns().length, 4);
        });

        it('with Colspan end', () => {
            const columnsConfig = [
                {
                    displayProperty: 'first',
                    stickyProperties: ['prop1', 'prop2']
                },
                {
                    displayProperty: 'second'
                }
            ];
            const gridRow = new GridDataRow({
                owner: {
                    ...mockedCollection,
                    getGridColumnsConfig: () => columnsConfig
                },
                colspanCallback: () => 'end',
                columnsConfig: columnsConfig,
                gridColumnsConfig: columnsConfig,
                contents: record
            });
            gridRow.updateLadder({}, { prop1: { headingStyle: 'style'}, prop2: {headingStyle: 'style'}});
            assert.isArray(gridRow.getColumns());
            assert.equal(gridRow.getColumns().length, 1);
        });

        it('with Colspan ', () => {
            const columnsConfig = [
                {
                    displayProperty: 'first',
                    stickyProperties: ['prop1']
                },
                {
                    displayProperty: 'second'
                },
                {
                    displayProperty: 'third'
                }
            ];
            const gridRow = new GridDataRow({
                owner: {
                    ...mockedCollection,
                    getGridColumnsConfig: () => columnsConfig
                },
                colspanCallback: () => 2,
                columnsConfig: columnsConfig,
                gridColumnsConfig: columnsConfig,
                contents: record
            });
            gridRow.updateLadder({}, { prop1: { headingStyle: 'style'}});
            assert.isArray(gridRow.getColumns());
            assert.equal(gridRow.getColumns().length, 2);
        });
    });
});
