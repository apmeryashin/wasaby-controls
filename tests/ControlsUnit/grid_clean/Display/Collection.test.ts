import { assert } from 'chai';
import { GridCollection } from 'Controls/grid';
import {TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {ERROR_MSG} from 'Controls/_grid/display/mixins/Grid';

describe('Controls/grid_clean/Display/Collection', () => {
    describe('Update options', () => {
        describe('multiSelectVisibility', () => {
            it('Initialize with multiSelectVisibility==="hidden" and set it to "visible"', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [{
                        displayProperty: 'id',
                        resultTemplate: () => 'result'
                    }],
                    footer: [{
                        template: () => 'footer'
                    }],
                    header: [{
                        template: () => 'header'
                    }],
                    emptyTemplate: 'emptyTemplate',
                    resultsPosition: 'top',
                    rowSeparatorSize: 's'
                });

                let columnItems = gridCollection.at(0).getColumns();
                assert.strictEqual(columnItems.length, 1);
                assert.strictEqual(columnItems[0].getRowSeparatorSize(), 's');

                let headerItems = gridCollection.getHeader().getRow().getColumns();
                assert.strictEqual(headerItems.length, 1);

                let resultsItems = gridCollection.getResults().getColumns();
                assert.strictEqual(resultsItems.length, 1);

                let footerItems = gridCollection.getFooter().getColumns();
                assert.strictEqual(footerItems.length, 1);

                let emptyGridItems = gridCollection.getEmptyGridRow().getColumns();
                assert.strictEqual(emptyGridItems.length, 1);
                assert.strictEqual(emptyGridItems[0].getColspan(), 1);

                // setMultiSelectVisibility
                gridCollection.setMultiSelectVisibility('visible');

                columnItems = gridCollection.at(0).getColumns();
                assert.strictEqual(columnItems.length, 2);
                assert.strictEqual(columnItems[0].getRowSeparatorSize(), 's');
                assert.strictEqual(columnItems[1].getRowSeparatorSize(), 's');

                headerItems = gridCollection.getHeader().getRow().getColumns();
                assert.strictEqual(headerItems.length, 2);

                resultsItems = gridCollection.getResults().getColumns();
                assert.strictEqual(resultsItems.length, 2);

                footerItems = gridCollection.getFooter().getColumns();
                assert.strictEqual(footerItems.length, 2);

                emptyGridItems = gridCollection.getEmptyGridRow().getColumns();
                assert.strictEqual(emptyGridItems.length, 1);
                assert.strictEqual(emptyGridItems[0].getColspan(), 2);
            });

            it('Initialize with multiSelectVisibility==="visible" and set it to "hidden"', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [{
                        displayProperty: 'id',
                        resultTemplate: () => 'result'
                    }],
                    footer: [{
                        template: () => 'footer'
                    }],
                    header: [{
                        template: () => 'header'
                    }],
                    emptyTemplate: 'emptyTemplate',
                    resultsPosition: 'top',
                    multiSelectVisibility: 'visible',
                    rowSeparatorSize: 's'
                });

                let columnItems = gridCollection.at(0).getColumns();
                assert.strictEqual(columnItems.length, 2);
                assert.strictEqual(columnItems[0].getRowSeparatorSize(), 's');
                assert.strictEqual(columnItems[1].getRowSeparatorSize(), 's');

                let headerItems = gridCollection.getHeader().getRow().getColumns();
                assert.strictEqual(headerItems.length, 2);

                let resultsItems = gridCollection.getResults().getColumns();
                assert.strictEqual(resultsItems.length, 2);

                let footerItems = gridCollection.getFooter().getColumns();
                assert.strictEqual(footerItems.length, 2);

                let emptyGridItems = gridCollection.getEmptyGridRow().getColumns();
                assert.strictEqual(emptyGridItems.length, 1);
                assert.strictEqual(emptyGridItems[0].getColspan(), 2);

                // setMultiSelectVisibility
                gridCollection.setMultiSelectVisibility('hidden');

                columnItems = gridCollection.at(0).getColumns();
                assert.strictEqual(columnItems.length, 1);
                assert.strictEqual(columnItems[0].getRowSeparatorSize(), 's');

                headerItems = gridCollection.getHeader().getRow().getColumns();
                assert.strictEqual(headerItems.length, 1);

                resultsItems = gridCollection.getResults().getColumns();
                assert.strictEqual(resultsItems.length, 1);

                footerItems = gridCollection.getFooter().getColumns();
                assert.strictEqual(footerItems.length, 1);

                emptyGridItems = gridCollection.getEmptyGridRow().getColumns();
                assert.strictEqual(emptyGridItems.length, 1);
                assert.strictEqual(emptyGridItems[0].getColspan(), 1);
            });
        });
        describe('resultsPosition', () => {
            it('Initialize with resultsPosition==="top"', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [{
                        displayProperty: 'id',
                        resultTemplate: () => 'result'
                    }],
                    resultsPosition: 'top'
                });

                assert.exists(gridCollection.getResults());
            });

            it('Initialize with resultsPosition==="top" and set it to "undefined"', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [{
                        displayProperty: 'id',
                        resultTemplate: () => 'result'
                    }],
                    resultsPosition: 'top'
                });

                gridCollection.setResultsPosition(undefined);
                assert.notExists(gridCollection.getResults());
            });

            it('Initialize with resultsPosition==="undefined"', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [{
                        displayProperty: 'id',
                        resultTemplate: () => 'result'
                    }]
                });

                assert.notExists(gridCollection.getResults());
            });

            it('Initialize with resultsPosition==="undefined" and set it to "top"', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [{
                        displayProperty: 'id',
                        resultTemplate: () => 'result'
                    }]
                });

                gridCollection.setResultsPosition('top');
                assert.exists(gridCollection.getResults());
            });
        });
        describe('resultsVisibility', () => {
            it('setResultsVisibility resets results object', () => {
                const gridCollection = new GridCollection({
                    collection: [],
                    keyProperty: 'key',
                    columns: [{
                        displayProperty: 'id',
                        resultTemplate: () => 'result'
                    }],
                    resultsPosition: 'top',
                    resultsVisibility: 'visible'
                });

                assert.exists(gridCollection.getResults());

                gridCollection.setResultsVisibility('hasdata');

                assert.notExists(gridCollection.getResults());
            });
        });
        describe('emptyTemplateColumns', () => {
            it('Initialize with emptyTemplateColumns', () => {
                const emptyColumnsConfig = [
                    {startColumn: 1, endColumn: 3, template: (() => 'EMPTY_COLUMN_TEMPLATE') as TemplateFunction}
                ];
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [
                        {displayProperty: 'id'},
                        {displayProperty: 'name'}
                    ],
                    emptyTemplateColumns: emptyColumnsConfig
                });

                assert.exists(gridCollection.getEmptyGridRow());
                assert.equal(gridCollection.getEmptyGridRow().getColumns()[0].config, emptyColumnsConfig[0]);
            });

            it('Initialize without emptyTemplateColumns', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [
                        {displayProperty: 'id'},
                        {displayProperty: 'name'}
                    ]
                });

                assert.notExists(gridCollection.getEmptyGridRow());
            });

            it('Initialize with emptyTemplateColumns and change it', () => {
                const emptyColumnsConfig = [
                    {startColumn: 1, endColumn: 3, template: (() => 'EMPTY_COLUMN_TEMPLATE') as TemplateFunction}
                ];
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [
                        {displayProperty: 'id'},
                        {displayProperty: 'name'}
                    ],
                    emptyTemplateColumns: emptyColumnsConfig
                });

                const oldEmptyTemplateRow = gridCollection.getEmptyGridRow();

                const newEmptyColumnsConfig = [
                    {startColumn: 1, endColumn: 3, template: (() => 'NEW_EMPTY_COLUMN_TEMPLATE') as TemplateFunction}
                ];
                gridCollection.setEmptyTemplateColumns(newEmptyColumnsConfig);
                assert.equal(oldEmptyTemplateRow, gridCollection.getEmptyGridRow());
                assert.equal(gridCollection.getEmptyGridRow().getColumns()[0].config, newEmptyColumnsConfig[0]);

            });

            it('Initialize without emptyTemplateColumns and set it', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [
                        {displayProperty: 'id'},
                        {displayProperty: 'name'}
                    ]
                });

                const emptyColumnsConfig = [
                    {startColumn: 1, endColumn: 3, template: (() => 'EMPTY_COLUMN_TEMPLATE') as TemplateFunction}
                ];
                gridCollection.setEmptyTemplateColumns(emptyColumnsConfig);
                assert.exists(gridCollection.getEmptyGridRow());
                assert.equal(gridCollection.getEmptyGridRow().getColumns()[0].config, emptyColumnsConfig[0]);
            });
        });

        it('editingConfig', () => {
            const gridCollection = new GridCollection({
                collection: [{ key: 1 }],
                keyProperty: 'key',
                columns: [{displayProperty: 'id'}],
                editingConfig: {}
            });

            assert.equal(gridCollection.getItems()[0].getVersion(), 0);
            gridCollection.setEditingConfig({mode: 'cell'});
            assert.equal(gridCollection.getItems()[0].getVersion(), 1);
        });

        describe('setStickyColumnsCount', () => {
            it('stickyColumnsCount should be less then column.length', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [
                        { displayProperty: 'id'},
                        { displayProperty: 'title'}
                    ]
                });

                const originLoggerErrorMethod = Logger.error;
                Logger.error = (msg) => {
                    throw msg;
                };

                assert.doesNotThrow(() => {
                    gridCollection.setStickyColumnsCount(1);
                });

                assert.throws(() => {
                    gridCollection.setStickyColumnsCount(2);
                }, ERROR_MSG.INVALID_STICKY_COLUMNS_COUNT_VALUE);

                assert.throws(() => {
                    gridCollection.setStickyColumnsCount(3);
                }, ERROR_MSG.INVALID_STICKY_COLUMNS_COUNT_VALUE);

                Logger.error = originLoggerErrorMethod;
            });
        });
    });
});
