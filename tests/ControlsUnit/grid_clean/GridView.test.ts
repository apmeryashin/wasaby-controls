import { GridView } from 'Controls/grid';
import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { GridCollection } from 'Controls/grid';

describe('Controls/grid_clean/GridView', () => {

    describe('Mount', () => {
        it('Check gridCollection version after mount', async () => {
            const collectionOptions = {
                collection: new RecordSet({
                    rawData: [{
                        key: 1,
                        title: 'item_1'
                    }],
                    keyProperty: 'key'
                }),
                keyProperty: 'key',
                columns: [{}]
            };
            const gridOptions = {
                listModel: new GridCollection(collectionOptions),
                keyProperty: 'key',
                columns: [{}],
                footerTemplate: () => '',
                footer: () => '',
                itemPadding: {}
            };
            const gridView = new GridView(gridOptions);
            await gridView._beforeMount(gridOptions);
            assert.strictEqual(gridView.getListModel().getVersion(), 0, 'Version must be equals zero! No other variants!');
        });

        it('componentDidMount: should forbid colspan groups if column scroll was shown.', async () => {
            const collectionOptions = {
                keyProperty: 'key',
                columns: [{}],
                collection: new RecordSet({
                    rawData: [{key: 1, title: 'item_1'}],
                    keyProperty: 'key'
                })
            };
            const gridOptions = {
                keyProperty: 'key',
                columns: [{}],
                itemPadding: {},
                columnScroll: true,
                listModel: new GridCollection(collectionOptions)
            };
            const gridView = new GridView(gridOptions);

            // MOCK COLUMN SCROLL MIXIN. IT WORKS WITH DOM.
            gridView._columnScrollOnViewBeforeMount = () => {/* FIXME: sinon mock */};
            gridView._columnScrollOnViewDidMount = () => {/* FIXME: sinon mock */};
            // EMULATE THAT COLUMN SCROLL NEEDED AND CREATED
            gridView.isColumnScrollVisible = () => true;
            // END MOCK

            await gridView._beforeMount(gridOptions);
            gridView.saveOptions(gridOptions);
            assert.isTrue(gridView.getListModel().getColspanGroup());
            gridView._componentDidMount();
            assert.isFalse(gridView.getListModel().getColspanGroup());
        });
    });

    describe('ColumnScroll', () => {
        let gridView: typeof GridView;
        let mockListViewModel;
        let options;

        beforeEach(() => {
            mockListViewModel = {
                subscribe: () => {/* FIXME: sinon mock */},
                setItemPadding: () => {/* FIXME: sinon mock */},
                isDragging: () => false
            };
            options = { listModel: mockListViewModel, isFullGridSupport: true };
            gridView = new GridView(options);
        });

        describe('._getGridTemplateColumns()', () => {
            it('should add actions column if list is empty', () => {
                const columns = [{}, {}];
                options.columns = columns;
                options.multiSelectVisibility = 'hidden';
                options.columnScroll = true;

                gridView._beforeMount(options);

                mockListViewModel.getCount = () => 0;
                mockListViewModel.getGridColumnsConfig = () => columns;
                mockListViewModel.getColumnsEnumerator = () => ({ getColumns: () => columns });
                assert.equal(gridView._getGridTemplateColumns(options), 'grid-template-columns: 1fr 1fr 0px;');
            });

            it('should add actions column if list in not empty', () => {
                const columns = [{}, {}];
                options.columns = columns;
                options.multiSelectVisibility = 'hidden';
                options.columnScroll = true;

                gridView._beforeMount(options);

                mockListViewModel.getCount = () => 10;
                mockListViewModel.getGridColumnsConfig = () => columns;
                mockListViewModel.getColumnsEnumerator = () => ({ getColumns: () => columns });
                assert.equal(gridView._getGridTemplateColumns(options), 'grid-template-columns: 1fr 1fr 0px;');
            });
        });
    });

    describe('_getGridViewClasses', () => {
        let options: {[p: string]: any};
        let fakeFooter: object;
        let fakeResults: object;
        let resultsPosition: string;

        async function getGridView(): typeof GridView {
            const optionsWithModel = {
                ...options,
                listModel: {
                    getFooter: () => fakeFooter,
                    getResults: () => fakeResults,
                    subscribe: () => {/* FIXME: sinon mock */},
                    setItemPadding: () => {/* FIXME: sinon mock */},
                    getResultsPosition: () => resultsPosition,
                    isDragging: () => false
                }};
            const grid = new GridView(optionsWithModel);
            await grid._beforeMount(optionsWithModel);
            return grid;
        }

        beforeEach(() => {
            fakeFooter = null;
            fakeResults = null;
            resultsPosition = null;
            options = {
                itemActionsPosition: 'outside',
                style: 'default',
                theme: 'default'
            };
        });

        it('should contain class when dragging', async () => {
            options.columns = [{}];
            const grid = await getGridView();
            grid._listModel.isDragging = () => true;
            const classes = grid._getGridViewClasses(options);
            assert.include(classes, 'controls-Grid_dragging_process');
        });
    });

    describe('ladder offset style', () => {
        it('_getLadderTopOffsetStyles', () => {
            let headerHeight = 100;
            let resultsHeight = 50;
            const options = {
                columns: [{}],
                ladderOffset: 'offset',
                ladderProperties: ['']
            };
            const gridView = new GridView(options);
            gridView._listModel = {
                getResultsPosition: () => 'top'
            };
            gridView._createGuid = () => 'guid';
            gridView._container = {
                getElementsByClassName: (className) => {
                    if (className === 'controls-Grid__header') {
                        return [
                            {
                                getComputedStyle: () => '',
                                getBoundingClientRect: () => ({height: headerHeight}),
                                closest: () => undefined
                            }
                        ];
                    }
                    if (className === 'controls-Grid__results') {
                        return [
                            {
                                getComputedStyle: () => '',
                                getBoundingClientRect: () => ({height: resultsHeight}),
                                closest: () => undefined
                            }
                        ];
                    }
                },
                closest: () => undefined
            };
            gridView.saveOptions(options);
            gridView._beforeMount(options);
            const expectedStyle = '.controls-GridView__ladderOffset-guid .controls-Grid__row-cell__ladder-spacing_withHeader_withResults {' +
                                    'top: calc(var(--item_line-height_l_grid) + offset + 150px) !important;' +
                                    '}' +
                                    '.controls-GridView__ladderOffset-guid .controls-Grid__row-cell__ladder-spacing_withHeader_withResults_withGroup {' +
                                    'top: calc(var(--item_line-height_l_grid) + var(--grouping_height_list) + offset + 150px) !important;' +
                                    '}' +
                                    '.controls-GridView__ladderOffset-guid .controls-Grid__row-cell__ladder-main_spacing_withGroup {' +
                                    'top: calc(var(--grouping_height_list) + offset + 150px) !important;}';
            gridView._ladderTopOffsetStyles = gridView._getLadderTopOffsetStyles();
            assert.equal(gridView._ladderTopOffsetStyles, expectedStyle);

            // Таблицу скрыли на switchableArea или на панели
            // Стиль не должен поменяться
            gridView._container.closest = (selector) => selector === '.ws-hidden' ? {} : null;
            headerHeight = 0;
            resultsHeight = 0;
            gridView._ladderTopOffsetStyles = gridView._getLadderTopOffsetStyles();
            assert.equal(gridView._ladderTopOffsetStyles, expectedStyle);
        });
        it('_getLadderTopOffsetStyles should return empty string if ladder disabled', () => {
            const gridView = new GridView({});
            assert.equal(gridView._getLadderTopOffsetStyles(), '');
        });
    });

    describe('Header', () => {
        let headerVisibility;
        let resultsVisibility;
        let colspanGroup;
        let gridView;

        beforeEach(() => {
            headerVisibility = false;
            colspanGroup = false;
            const options = {
                headerVisibility: 'hasdata'
            };
            gridView = new GridView(options);
            gridView.saveOptions(options);
            gridView._listModel = {
                setHeaderVisibility: (value) => {
                    headerVisibility = value;
                },
                setResultsVisibility: (value) => {
                    resultsVisibility = value;
                },
                setColspanGroup: (value) => {
                    colspanGroup = value;
                }
            };
        });

        it('update header visibility', () => {
            const newVisibility = 'visible';
            gridView._beforeUpdate({headerVisibility: newVisibility});
            assert.equal(headerVisibility, newVisibility);
        });

        it('update results visibility', () => {
            const newVisibility = 'visible';
            gridView._beforeUpdate({resultsVisibility: newVisibility});
            assert.equal(resultsVisibility, newVisibility);
        });

        it('update colspanGroup', () => {
            gridView._beforeUpdate({});
            assert.equal(colspanGroup, true);
        });
    });

    it('should update itemEditorTemplateOptions', () => {
        let gridView;
        let itemEditorTemplateOptions;

        const options = {
            itemEditorTemplateOptions: 'initialValue'
        };
        gridView = new GridView(options);
        gridView.saveOptions(options);
        gridView._listModel = {
            setItemEditorTemplateOptions: (value) => {
                itemEditorTemplateOptions = value;
            },
            setColspanGroup: () => {/* FIXME: sinon mock */}
        };

        gridView._beforeUpdate({itemEditorTemplateOptions: 'newValue'});
        assert.equal(itemEditorTemplateOptions, 'newValue');
    });
});
