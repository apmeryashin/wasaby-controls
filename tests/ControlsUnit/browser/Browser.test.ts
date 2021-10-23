import {Browser, IBrowserOptions, IListConfiguration} from 'Controls/browser';
import {Memory, PrefetchProxy, DataSet} from 'Types/source';
import { RecordSet } from 'Types/collection';
import { detection } from 'Env/Env';
import {assert} from 'chai';
import * as sinon from 'sinon';
import {adapter} from 'Types/entity';
import {NewSourceController, getControllerState} from 'Controls/dataSource';
import {ControllerClass as SearchController} from 'Controls/search';
import * as clone from 'Core/core-clone';

type TPartialListConfiguration = Partial<IListConfiguration>;

const browserData = [
    {
        id: 0,
        name: 'Sasha'
    },
    {
        id: 1,
        name: 'Aleksey'
    },
    {
        id: 2,
        name: 'Dmitry'
    }
];

const browserHierarchyData = [
    {
        key: 0,
        title: 'Интерфейсный фреймворк',
        parent: null
    },
    {
        key: 1,
        title: 'Sasha',
        parent: 0
    },
    {
        key: 2,
        title: 'Dmitry',
        parent: null
    }
];

const eventMock = {
    stopPropagation: () => void 0,
    preventDefault: () => void 0
};

function getBrowserOptions(): Partial<IBrowserOptions> {
    return {
        minSearchLength: 3,
        source: new Memory({
            keyProperty: 'id',
            data: browserData
        }),
        searchParam: 'name',
        filter: {},
        keyProperty: 'id'
    };
}

function getBrowserOptionsHierarchy(): Partial<IBrowserOptions> {
    return {
        ...getBrowserOptions(),
        parentProperty: 'parent',
        source: new Memory({
            keyProperty: 'id',
            data: browserHierarchyData
        })
    };
}

function getBrowser(options: object = {}): Browser {
    return new Browser(options);
}

async function getBrowserWithMountCall(options: object = {}): Promise<Browser> {
    const brow = getBrowser(options);
    await brow._beforeMount(options);
    brow.saveOptions(options);
    brow._afterMount(options);
    return brow;
}

function getListsOptions(): TPartialListConfiguration[] {
    const browserOptions = getBrowserOptions();
    return [
        {
            id: 'list',
            ...browserOptions
        },
        {
            id: 'list2',
            ...browserOptions
        }
    ];
}

describe('Controls/browser:Browser', () => {

    describe('_beforeMount', () => {

        describe('init states on beforeMount', () => {

            it('root', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._root === null);

                options = {...options};
                options.root = 'testRoot';
                await browser._beforeMount(options);
                assert.ok(browser._root === 'testRoot');
            });

            it('viewMode', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._viewMode === undefined);

                options = {...options};
                options.viewMode = 'table';
                await browser._beforeMount(options);
                assert.ok(browser._viewMode === 'table');
            });

            it('items', async () => {
                const options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._items.getCount() === 3);
            });

            it('searchValue/inputSearchValue', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._searchValue === '');
                assert.ok(browser._inputSearchValue === '');

                options = {...options};
                options.searchValue = 'tes';
                await browser._beforeMount(options);
                assert.ok(browser._searchValue === 'tes');
                assert.ok(browser._inputSearchValue === 'tes');
                assert.ok(browser._viewMode === 'search');
            });

            it('source returns error', async () => {
                const options = getBrowserOptions();
                options.source.query = () => {
                    const error = new Error();
                    error.processed = true;
                    return Promise.reject(error);
                };
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                assert.ok(browser._contextState.source === options.source);
            });

            it('_beforeMount with receivedState and dataLoadCallback', async () => {
                const receivedState = {
                   data: new RecordSet(),
                   historyItems: [
                       {
                           name: 'filterField',
                           value: 'filterValue',
                           textValue: 'filterTextValue'
                       }
                   ]
                };
                const options = getBrowserOptions();
                let dataLoadCallbackCalled = false;

                options.filterButtonSource = [
                    {
                        name: 'filterField',
                        value: '',
                        textValue: ''
                    }
                ];
                options.dataLoadCallback = () => {
                    dataLoadCallbackCalled = true;
                };
                options.filter = {};
                const browser = getBrowser(options);
                await browser._beforeMount(options, {}, [receivedState]);
                browser.saveOptions(options);

                assert.ok(dataLoadCallbackCalled);
                assert.deepStrictEqual(browser._filter, {filterField: 'filterValue'});
            });

            it('_beforeMount without receivedState and historyItems in options', async () => {
                const options = getBrowserOptions();
                options.filterButtonSource = [{
                    name: 'filterField',
                    value: '',
                    textValue: ''
                }];
                options.historyItems = [{
                    name: 'filterField',
                    value: 'historyValue'
                }];
                options.filter = {};
                const browser = getBrowser(options);
                await browser._beforeMount(options, {});
                browser.saveOptions(options);
                assert.deepStrictEqual(browser._filter, {filterField: 'historyValue'});
            });

            describe('sourceController on mount', () => {
               it('sourceController in options', async () => {
                   const options = getBrowserOptions();
                   const sourceController = new NewSourceController(options);
                   options.sourceController = sourceController;
                   const browser = getBrowser(options);
                   await browser._beforeMount(options);
                   assert.ok(browser._getSourceController() === sourceController);
               });
               it('sourceController in context', async () => {
                   const options = getBrowserOptions();
                   const sourceController = new NewSourceController(options);
                   options._dataOptionsValue = {
                       sourceController
                   };
                   const browser = getBrowser(options);
                   await browser._beforeMount(options);
                   assert.ok(browser._getSourceController() === sourceController);
               });
               it('sourceController in listsConfig', async () => {
                   const options = getBrowserOptions();
                   const sourceController = new NewSourceController(options);
                   options._dataOptionsValue = {
                       listsConfigs: {
                           testSourceControllerId: {
                               sourceController
                           }
                       }
                   };
                   options.sourceControllerId = 'testSourceControllerId';
                   const browser = getBrowser(options);
                   await browser._beforeMount(options);
                   assert.ok(browser._getSourceController() === sourceController);
               });
            });

            describe('init expandedItems', () => {
                it('with receivedState', async () => {
                    const receivedState = {
                        data: new RecordSet(),
                        historyItems: []
                    };
                    const options = getBrowserOptions();
                    options.expandedItems = [1];
                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {}, [receivedState]);
                    assert.deepEqual(browser._contextState.expandedItems, [1]);
                    assert.deepEqual(browser._getSourceController().getExpandedItems(), [1]);
                });

                it('without receivedState', async () => {
                    const options = getBrowserOptions();
                    options.expandedItems = [1];
                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {}, []);
                    assert.deepEqual(browser._contextState.expandedItems, [1]);
                    assert.deepEqual(browser._getSourceController().getExpandedItems(), [1]);
                });
            });
        });

        describe('searchController', () => {

            describe('searchValue on _beforeMount', () => {

                it('searchValue is longer then minSearchLength', () => {
                    const options = getBrowserOptions();
                    options.searchValue = 'Sash';
                    const browser = getBrowser(options);
                    return new Promise((resolve) => {
                        browser._beforeMount(options, {}).then(() => {
                            assert.equal(browser._searchValue, 'Sash');
                            resolve();
                        });
                    });
                });

                it('filter in context without source on _beforeMount', async () => {
                    const options = getBrowserOptions();
                    const filter = {
                        testField: 'testValue'
                    };
                    options.source = null;
                    options.filter = filter;

                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {});
                    assert.deepStrictEqual(browser._contextState.filter, filter);
                    assert.deepStrictEqual(browser._filter, filter);
                });

                it('filterButtonSource and filter in context without source on _beforeMount', async () => {
                    const options = getBrowserOptions();
                    const filter = {
                        testField: 'testValue'
                    };
                    options.source = null;
                    options.filter = filter;
                    options.filterButtonSource = [{
                        id: 'testField2',
                        value: 'testValue2'
                    }];

                    const expectedFilter = {
                        testField: 'testValue',
                        testField2: 'testValue2'
                    };

                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {});
                    assert.deepStrictEqual(browser._contextState.filter, expectedFilter);
                    assert.deepStrictEqual(browser._filter, expectedFilter);
                });

            });

            describe('search', () => {
                it('search query returns error', async () => {
                    let dataErrorProcessed = false;
                    let propagationStopped = false;
                    const eventMock = {
                        stopPropagation: () => {
                            propagationStopped = true;
                        }
                    };
                    const options = {...getBrowserOptions(), dataLoadErrback: () => {
                            dataErrorProcessed = true;
                        }
                    };
                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {});
                    browser.saveOptions(options);
                    options.source.query = () => {
                        const error = new Error();
                        error.processed = true;
                        return Promise.reject(error);
                    };

                    await browser._search(eventMock, 'test');
                    assert.isTrue(dataErrorProcessed);
                    assert.isTrue(propagationStopped);
                    assert.isFalse(browser._loading);
                    assert.deepStrictEqual(browser._filter, {name: 'test'});
                    assert.ok(browser._searchValue === 'test');
                });

                it('double search call will create searchController once', async () => {
                    const browserOptions = getBrowserOptions();
                    const browser = getBrowser(browserOptions);
                    await browser._beforeMount(browserOptions);
                    browser.saveOptions(browserOptions);

                    const searchControllerCreatedPromise1 = browser._getSearchController(browserOptions);
                    const searchControllerCreatedPromise2 = browser._getSearchController(browserOptions);

                    const searchController1 = await searchControllerCreatedPromise1;
                    const searchController2 = await searchControllerCreatedPromise2;
                    assert.isTrue(searchController1 === searchController2);
                });
                it('loading state on search', async () => {
                    const browserOptions = getBrowserOptions();
                    const browser = getBrowser(browserOptions);
                    await browser._beforeMount(browserOptions);
                    browser.saveOptions(browserOptions);
                    const searchPromise = browser._search(null, 'test');
                    assert.ok(browser._loading);
                    await searchPromise;
                    assert.ok(!browser._loading);
                    assert.ok(browser._searchValue === 'test');

                    // search with same value
                    searchPromise = browser._search(null, 'test');
                    assert.ok(browser._loading);
                    await searchPromise;
                    assert.ok(!browser._loading);
                });

                it('empty searchParam in options', async () => {
                    const browserOptions = getBrowserOptions();
                    delete browserOptions.searchParam;
                    const browser = getBrowser(browserOptions);
                    await browser._beforeMount(browserOptions);
                    browser.saveOptions(browserOptions);
                    const searchPromise = browser._search(null, 'test');
                    assert.ok(!browser._loading);
                    await searchPromise;
                    assert.ok(!browser._loading);
                });
                it('search with root was canceled', async () => {
                    const options = {
                        ...getBrowserOptions(),
                        startingWith: 'root',
                        root: 'currentRoot',
                        parentProperty: 'parent'
                    };
                    const path = new RecordSet({
                        rawData: [
                            {
                                id: 0,
                                parent: 'root'
                            }
                        ],
                        keyProperty: 'id'
                    });
                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {});
                    browser.saveOptions(options);
                    await browser._getSearchController();
                    browser._getSearchControllerSync().setPath(path);
                    options.source.query = () => {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(new DataSet());
                            }, 100);
                        });
                    };

                    const sourceController = browser._getSourceController();
                    const currentRoot = sourceController.getRoot();
                    const searchPromise = browser._search(eventMock, 'test');
                    await browser._getSearchController();

                    browser._resetSearch();
                    // root проставляется в обработчике ошибки promise, а этот код всегда асинхронный
                    await searchPromise;
                    assert.ok(sourceController.getRoot() === currentRoot);
                });

                it('reset search with listsOptions', async () => {
                    const browserOptions = getBrowserOptions();
                    const listsOptions = getListsOptions();
                    listsOptions[1].searchParam = '';
                    const options = {
                        ...browserOptions,
                        listsOptions
                    };
                    const browser = getBrowser(options);
                    await browser._beforeMount(options);
                    browser.saveOptions(options);
                    await browser._search(null, 'testSearchValue');
                    browser._resetSearch();
                    assert.ok(!browser._searchValue);
                });

                it('reset search, option does not change', async () => {
                    const browserOptions = getBrowserOptions();
                    browserOptions.searchValue = 'test';
                    const browser = await getBrowserWithMountCall(browserOptions);

                    await browser._resetSearch();
                    await browser._beforeUpdate(browserOptions);
                    assert.ok(browser._searchValue === 'test');
                });
            });

            it('root is not changed, but root in searchController is updated', async () => {
                let browserOptions = getBrowserOptionsHierarchy();
                const searchController = new SearchController(getBrowserOptionsHierarchy());
                browserOptions.searchController = searchController;
                browserOptions.root = null;
                const browser = await getBrowserWithMountCall(browserOptions);

                searchController.setRoot('anyRoot');
                browserOptions = {...browserOptions};
                await browser._beforeUpdate(browserOptions);
                assert.ok(searchController.getRoot() === null);
            });

            describe('_searchReset', () => {
                it('_searchReset while loading', async () => {
                    const options = getBrowserOptions();
                    const browser = getBrowser(options);
                    await browser._beforeMount(options);
                    browser.saveOptions(options);

                    const sourceController = browser._getSourceController();
                    sourceController.reload();
                    browser._searchResetHandler();
                    assert.ok(!sourceController.isLoading());
                });

                it('_searchReset with startingWith === "current"', async () => {
                    const options = getBrowserOptions();
                    options.startingWith = 'current';
                    options.root = 'testRoot';
                    options.source.query = (query) => {
                        const recordSet = new RecordSet();
                        recordSet.setMetaData({
                            path: new RecordSet({
                                rawData: [
                                    {
                                        id: query.getWhere()[options.parentProperty]
                                    }
                                ]
                            })
                        });
                        return Promise.resolve(recordSet);
                    };
                    const browser = getBrowser(options);
                    await browser._beforeMount(options);
                    browser.saveOptions(options);

                    await browser._search(eventMock, 'testSearchValue');
                    assert.ok(browser._root === 'testRoot');

                    await browser._searchResetHandler();
                    assert.ok(browser._root === 'testRoot');
                });
            });
        });

        describe('init shadow visibility', () => {
            const recordSet = new RecordSet({
                rawData: [{id: 1}],
                keyProperty: 'id',
                metaData: {
                    more: {
                        before: true,
                        after: true
                    }
                }
            });

            const options = getBrowserOptions();

            let browser;

            let defaultIsMobilePlatformValue;

            beforeEach(() => {
                defaultIsMobilePlatformValue = detection.isMobilePlatform;
            });

            afterEach(() => {
                detection.isMobilePlatform = defaultIsMobilePlatformValue;
            });

            it('items in receivedState', () => {
                const newOptions = {
                    ...options,
                    topShadowVisibility: 'auto',
                    bottomShadowVisibility: 'auto'
                };

                browser = new Browser(newOptions);
                browser._beforeMount(newOptions, {}, [{data: recordSet, historyItems: [] }]);
                assert.equal(browser._topShadowVisibility, 'gridauto');
                assert.equal(browser._bottomShadowVisibility, 'gridauto');

                detection.isMobilePlatform = true;

                browser = new Browser(newOptions);
                browser._beforeMount(newOptions, {}, [{data: recordSet, historyItems: [] }]);
                assert.equal(browser._topShadowVisibility, 'auto');
                assert.equal(browser._bottomShadowVisibility, 'auto');
            });
        });

        it('source returns error', async () => {
            const options = getBrowserOptions();
            options.source.query = () => {
                const error = new Error('testError');
                error.processed = true;
                return Promise.reject(error);
            };
            const browser = getBrowser(options);

            const result = await browser._beforeMount(options);
            assert.ok(result instanceof Error);
        });

        it('source as prefetchProxy', async () => {
           const options = getBrowserOptions();
           const source = options.source;
           options.source = new PrefetchProxy({
               target: source,
               data: {
                   query: new DataSet()
               }
           });
           const browser = getBrowser(options);
           await browser._beforeMount(options);
           browser.saveOptions(options);
           assert.ok(browser._source === options.source);

           await browser._beforeUpdate(options);
           assert.ok(browser._getSourceController().getSource() === options.source);
           assert.ok(browser._source === options.source);
        });

        it('source as prefetchProxy and with receivedState', async () => {
            const options = getBrowserOptions();
            const receivedState = {
                data: new RecordSet(),
                historyItems: [
                    {
                        name: 'filterField',
                        value: 'filterValue',
                        textValue: 'filterTextValue'
                    }
                ]
            };
            const source = options.source;
            options.source = new PrefetchProxy({
                target: source,
                data: {
                    query: new DataSet()
                }
            });
            const browser = getBrowser(options);
            await browser._beforeMount(options, {}, [receivedState]);
            browser.saveOptions(options);
            assert.ok(browser._source === source);

            await browser._beforeUpdate(options);
            assert.ok(browser._getSourceController().getSource() === source);
            assert.ok(browser._source === source);
        });

    });

    describe('_beforeUpdate', () => {

        it('selectionViewMode changed', async () => {
            let options = getBrowserOptions();
            options.selectedKeys = ['testKey'];
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);

            options = {...options};
            options.selectionViewMode = 'selected';
            await browser._beforeUpdate(options);
            assert.ok(browser._filter.SelectionWithPath);
        });

        describe('searchController', () => {

            it('filter in searchController updated', async () => {
                const options = getBrowserOptions();
                const filter = {
                    testField: 'newFilterValue'
                };
                options.filter = filter;
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser._filter = {
                    testField: 'oldFilterValue'
                };
                browser._options.source = options.source;
                browser._getSourceController().updateOptions = () => true;
                const searchController = await browser._getSearchController(browser._options);
                options.searchValue = 'oldFilterValue';
                await browser._beforeUpdate(options);
                assert.deepStrictEqual(searchController._options.filter, filter);
            });

            it('filter and source are updated, searchValue is cleared', async () => {
                let options = getBrowserOptions();

                options.filter = { testField: 'filterValue' };
                options.searchValue = 'searchValue';
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);
                assert.deepStrictEqual(browser._filter, {
                    testField: 'filterValue',
                    name: 'searchValue'
                });
                await browser._getSearchController();

                options = {...options};
                options.filter = { testField: 'newFilterValue' };
                options.searchValue = '';
                options.source = new Memory();
                await browser._beforeUpdate(options);
                assert.deepStrictEqual(browser._filter, { testField: 'newFilterValue' });
                assert.deepStrictEqual(browser._getSourceController().getFilter(), { testField: 'newFilterValue' });
            });

            it('searchParam is changed', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);
                await browser._getSearchController();

                options = {...options};
                options.searchParam = 'newSearchParam';
                await browser._beforeUpdate(options);
                assert.ok(browser._getSearchControllerSync()._options.searchParam === 'newSearchParam');
            });

            it('update with searchValue', async () => {
                let options = getBrowserOptions();
                const filter = {
                    testField: 'newFilterValue'
                };
                options.filter = filter;
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);
                await browser._getSearchController();

                options = {...options};
                options.filter = {};
                options.searchValue = 'test';
                browser._beforeUpdate(options);
                assert.deepStrictEqual(browser._filter.name, 'test');

                options = {...options};
                delete options.searchValue;
                options.filter = {
                    testField: 'newFilterValue'
                };
                browser._searchValue = 'test';
                browser._beforeUpdate(options);
                assert.deepStrictEqual(browser._filter.name, 'test');
                assert.ok(browser._getSearchControllerSync().getRoot() === null);
            });

            it('update source and searchValue should reset inputSearchValue', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);

                await browser._search(null, 'testSearchValue');
                options.searchValue = 'testSearchValue';
                browser.saveOptions(options);
                assert.ok(browser._inputSearchValue === 'testSearchValue');
                assert.deepStrictEqual(browser._filter, {name: 'testSearchValue'});

                options = {...options};
                options.source = new Memory();
                options.searchValue = '';
                browser._beforeUpdate(options);
                assert.ok(!browser._inputSearchValue);
                assert.deepStrictEqual(browser._filter, {});
            });

            it('update source and reset searchValue', async () => {
                let options = getBrowserOptions();
                options.searchValue = 'testSearchValue';
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);
                await browser._getSearchController(options);

                assert.ok(browser._searchValue === 'testSearchValue');
                assert.ok(browser._inputSearchValue === 'testSearchValue');
                assert.ok(browser._filter.name === 'testSearchValue');

                options = {...options};
                options.source = new Memory();
                options.searchValue = '';
                browser._beforeUpdate(options);
                assert.ok(!browser._inputSearchValue);
                assert.ok(!browser._filter.name);
            });

            it('update root and reset searchValue', async () => {
                let options = getBrowserOptionsHierarchy();
                options.searchValue = 'testSearchValue';
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);

                options = {...options};
                options.root = 0;
                options.searchValue = '';
                await browser._beforeUpdate(options);
                assert.ok(!browser._filter.name);
            });

            it('cancel query while searching', async () => {
                const options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);

                browser._search(null, 'testSearchValue');
                await browser._getSearchController(options);
                assert.ok(browser._loading);

                browser._dataLoader.getSourceController().cancelLoading();
                assert.ok(browser._loading);
            });

            it('search returns recordSet with another format', async () => {
                const options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);

                browser._source.query = () => {
                    return Promise.resolve(
                        new RecordSet({
                            adapter: new adapter.Sbis(),
                            format: [
                                { name: 'testName2', type: 'string' }
                            ]
                        })
                    );
                };
                await browser._search(null, 'testSearchValue');
                assert.ok(browser._sourceControllerState.items.getFormat().getFieldIndex('testName2') !== -1);
                assert.ok(browser._items.getFormat().getFieldIndex('testName2') !== -1);
            });

        });

        describe('operationsController', () => {

            it('listMarkedKey is updated by markedKey in options', async () => {
                const options = getBrowserOptions();
                options.markedKey = 'testMarkedKey';
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser._beforeUpdate(options);
                assert.deepStrictEqual(browser._operationsController._savedListMarkedKey, 'testMarkedKey');

                options.markedKey = undefined;
                browser._beforeUpdate(options);
                assert.deepStrictEqual(browser._operationsController._savedListMarkedKey, 'testMarkedKey');
            });

        });

        describe('sourceController', () => {
            it('update expandedItems', async () => {
                const options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser._beforeUpdate({...options, expandedItems: [1]});
                assert.deepEqual(browser._getSourceController().getExpandedItems(), [1]);
            });

            it('sourceController is changed', async () => {
                let options = getBrowserOptions();
                options.parentProperty = 'testParentProperty';
                options.sourceController = new NewSourceController({...options});
                const browser = await getBrowserWithMountCall(options);

                const sourceController = new NewSourceController({...options});
                options = {...options};
                options.sourceController = sourceController;
                await browser._beforeUpdate(options);
                assert.ok(browser._getSourceController() === sourceController);

                sourceController.setRoot('newRoot');
                assert.ok(browser._root === 'newRoot');
            });

            it('backButtonCaption is updated after items changed in sourceController', async () => {
                const options = getBrowserOptions();
                options.parentProperty = 'testParentProperty';
                options.displayProperty = 'title';
                const sourceController = options.sourceController = new NewSourceController({...options});
                const browser = await getBrowserWithMountCall(options);

                const items = new RecordSet();
                items.setMetaData({
                    path: new RecordSet({
                        rawData: [{id: 0, title: 'test'}]
                    })
                });

                sourceController.setItems(items);
                // _contextState, пока нет возможности тестировать вёрстку и то, что прокидывается в вёрстку
                assert.ok(browser._contextState.backButtonCaption === 'test');
            });

            describe('listsOptions', () => {
                it('prefetchProxy source in listsOptions', async () => {
                    const browserOptions = getBrowserOptions();
                    const source = new Memory();
                    const prefetchSource = new PrefetchProxy({
                        target: source,
                        data: {
                            query: new RecordSet({
                                rawData: browserData
                            })
                        }
                    });
                    const listsOptions = [
                        {
                            id: 'list',
                            ...browserOptions,
                            source: prefetchSource
                        }
                    ];
                    const options = {
                        ...browserOptions,
                        listsOptions
                    };
                    const browser = getBrowser(options);
                    await browser._beforeMount(options, null, [{data: new RecordSet({rawData: browserData})}]);
                    browser.saveOptions(options);
                    await browser._beforeUpdate(options);
                    assert.ok(browser._getSourceController().getState().source === source);
                });

                it('listsOptions are changed', async () => {
                    const browserOptions = getBrowserOptions();
                    let listsOptions = [
                        {
                            id: 'list',
                            ...browserOptions
                        }
                    ];
                    let options = {
                        ...browserOptions,
                        listsOptions
                    };
                    const browser = getBrowser(options);
                    await browser._beforeMount(options, null, [{data: new RecordSet({rawData: browserData})}]);
                    browser.saveOptions(options);

                    const newSource = new Memory();
                    listsOptions = [{...listsOptions[0]}];
                    listsOptions[0].id = 'list2';
                    listsOptions[0].source = newSource;
                    options = {...options};
                    options.listsOptions = listsOptions;

                    await browser._beforeUpdate(options);
                    assert.ok(browser._getSourceController().getState().source === newSource);
                });

                it('sourceController on listsOptions', async () => {
                    const browserOptions = getBrowserOptions();
                    const sourceController = new NewSourceController({
                        source: browserOptions.source,
                        id: 'list'
                    });
                    const listsOptions = [
                        {
                            id: 'list',
                            ...browserOptions,
                            sourceController
                        }
                    ];
                    const options = {
                        ...browserOptions,
                        listsOptions
                    };
                    const browser = getBrowser(options);
                    await browser._beforeMount(options);
                    browser.saveOptions(options);

                    assert.ok(browser._getSourceController() === sourceController);

                    sourceController.setRoot('testRoot');
                    assert.ok(listsOptions[0].root === 'testRoot');
                });
                it('filterButtonSource in listsOptions', async () => {
                    const browserOptions = getBrowserOptions();
                    const filterButtonSource = [
                        {
                            name: 'filterField',
                            value: '',
                            textValue: ''
                        }
                    ];
                    const listsOptions = [
                        {
                            id: 'list',
                            ...browserOptions,
                            filterButtonSource,
                            filter: {
                                testField: 'testValue'
                            }
                        },
                        {
                            id: 'list1',
                            ...browserOptions,
                            filterButtonSource,
                            filter: {
                                testField1: 'testValue'
                            }
                        }
                    ];
                    const options = {
                        ...browserOptions,
                        listsOptions
                    };
                    const browser = getBrowser(options);
                    await browser._beforeMount(options);
                    browser.saveOptions(options);
                    await browser._beforeUpdate(options);
                    assert.deepStrictEqual(browser._dataLoader.getFilterController('list').getFilter(), {
                        testField: 'testValue',
                        filterField: ''
                    });
                });

                it('root changed with sourceController in listsOptions', async () => {
                    const listsOptions = getListsOptions();
                    let browserOptions = getBrowserOptions();
                    const sourceController = new NewSourceController({
                        source: browserOptions.source
                    });
                    listsOptions[1].sourceController = sourceController;
                    browserOptions = {
                        ...browserOptions,
                        listsOptions
                    };

                    const browser = await getBrowserWithMountCall(browserOptions);
                    const notifyStub = sinon.stub(browser, '_notify');
                    sourceController.setRoot('testRoot');
                    assert.ok(notifyStub.withArgs('rootChanged', ['testRoot', 'list2']).calledOnce);
                });

                it('filter changed in listsOptions', async () => {
                    const listsOptions = getListsOptions();
                    let browserOptions = getBrowserOptions();
                    const sourceController1 = new NewSourceController({
                        source: browserOptions.source
                    });
                    const sourceController2 = new NewSourceController({
                        source: browserOptions.source
                    });
                    listsOptions[0].sourceController = sourceController1;
                    listsOptions[1].searchParam = '';
                    listsOptions[1].sourceController = sourceController2;
                    browserOptions = {
                        ...browserOptions,
                        listsOptions
                    };

                    const browser = getBrowser(browserOptions);
                    await browser._beforeMount(browserOptions);
                    browser.saveOptions(browserOptions);

                    browserOptions = clone(browserOptions);
                    browserOptions.listsOptions[0].filter = {testField: 'testValue'};
                    browserOptions.listsOptions[1].filter = {testField1: 'testValue1'};
                    await browser._beforeUpdate(browserOptions);
                    assert.deepStrictEqual(sourceController1.getFilter(), {testField: 'testValue'});
                    assert.deepStrictEqual(sourceController2.getFilter(), {testField1: 'testValue1'});
                });
            });
        });

        describe('filterController', () => {
            it('filterButtonSource changed', async () => {
                const browserOptions = getBrowserOptions();
                browserOptions.filterButtonSource = [
                    {
                        name: 'filterField',
                        value: '',
                        textValue: ''
                    }
                ];
                browserOptions.filter = {
                    filterField2: ''
                };
                const browser = getBrowser(browserOptions);
                await browser._beforeMount(browserOptions);
                browser.saveOptions(browserOptions);

                const notifyStub = sinon.stub(browser, '_notify');
                browserOptions = {...browserOptions};
                browserOptions.filterButtonSource = [
                    {
                        name: 'filterField',
                        value: 'test',
                        textValue: ''
                    }
                ];
                await browser._beforeUpdate(browserOptions);
                assert.isTrue(notifyStub.withArgs('filterChanged', [{filterField: 'test', filterField2: ''}]).called);
                assert.deepStrictEqual(browser._filter, {filterField: 'test', filterField2: ''});

                browserOptions = {...browserOptions};
                browserOptions.filterButtonSource = [
                    {
                        name: 'filterField',
                        value: 'test',
                        textValue: ''
                    },
                    {
                        name: 'filterField2',
                        value: '',
                        resetValue: '',
                        textValue: ''
                    }
                ];
                await browser._beforeUpdate(browserOptions);
                assert.isTrue(notifyStub.withArgs('filterChanged', [{filterField: 'test', filterField2: '' }]).calledOnce);
                assert.deepStrictEqual(browser._filter, {filterField: 'test', filterField2: ''});
            });
        });

        it('update source', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();

            await browser._beforeMount(options);

            options = {...options};
            options.source = new Memory({
                data: browserHierarchyData,
                keyProperty: 'key'
            });

            await browser._beforeUpdate(options);
            assert.ok(browser._items.at(0).get('title') === 'Интерфейсный фреймворк');
        });

        it('update source while loading', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();
            const errorStub = sinon.stub(browser, '_onDataError');

            await browser._beforeMount(options);

            options = {...options};
            options.source = new Memory({
                data: browserHierarchyData,
                keyProperty: 'key'
            });
            browser._beforeUpdate(options);

            options.source = new Memory({
                data: browserHierarchyData,
                keyProperty: 'key'
            });
            await browser._beforeUpdate(options);

            assert.ok(errorStub.notCalled);
        });

        it('source returns error, then _beforeUpdate', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();

            options.source.query = () => {
                const error = new Error();
                error.processed = true;
                return Promise.reject(error);
            };
            await browser._beforeMount(options);

            function update() {
                browser._beforeUpdate(options);
            }
            options = {...options};
            assert.doesNotThrow(update);
        });

        it('new source in beforeUpdate returns error', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();

            await browser._beforeMount(options);

            options = {...options};
            options.source = new Memory();
            options.source.query = () => {
                const error = new Error();
                error.processed = true;
                return Promise.reject(error);
            };
            await browser._beforeUpdate(options);
            assert.ok(browser._errorRegister);
        });

        it('beforeUpdate without source', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();

            await browser._beforeMount(options);
            browser.saveOptions(options);

            options = {...options};
            options.source = null;
            options.filter = {newFilterField: 'newFilterValue'};

            await browser._beforeUpdate(options);
            assert.deepStrictEqual(browser._filter, {newFilterField: 'newFilterValue'});
        });

        it('if searchValue is empty, then the same field i filter must be reset', async () => {
            const sandbox = sinon.createSandbox();
            const browser = getBrowser();
            const filter = {
                payload: 'something'
            };
            let options = {...getBrowserOptions(), searchValue: '123', filter};
            await browser._beforeMount(options);
            browser.saveOptions(options);

            const sourceController = browser._getSourceController();
            sourceController.setFilter({...filter, name: 'test123'});
            const filterChangedStub = sandbox.stub(browser, '_filterChanged');

            options = {...options};
            options.searchValue = '';

            await browser._beforeUpdate(options);
            assert.isTrue(filterChangedStub.withArgs( null, {payload: 'something'}).calledOnce);
            sandbox.restore();
        });

        it('update viewMode', async () => {
            const sandbox = sinon.createSandbox();
            let options = getBrowserOptions();
            const browser = getBrowser();

            options.viewMode = 'table';
            await browser._beforeMount(options);
            browser.saveOptions(options);

            assert.equal(browser._viewMode, 'table');

            options = {...options, viewMode: 'tile'};
            browser._beforeUpdate(options);

            assert.equal(browser._viewMode, 'tile');
        });

        it('update expanded items in context', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser._beforeUpdate({...options, expandedItems: [1]});
            assert.deepEqual(browser._contextState.expandedItems, [1]);
        });

        it('items in sourceController are changed', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);

            const items = new RecordSet();
            browser._getSourceController().setItems(null);
            browser._getSourceController().setItems(items);

            browser._beforeUpdate(options);
            assert.ok(browser._items === items);
        });

        it('items in sourceController are changed', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);

            const items = new RecordSet();
            browser._getSourceController().setItems(null);
            browser._getSourceController().setItems(items);

            browser._beforeUpdate(options);
            assert.ok(browser._items === items);
        });

        it('update with stateStorageId in options', async () => {
            let options = getBrowserOptions();
            options.stateStorageId = 'testStorageId';
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);

            options = {...options};
            options.selectedKeys = ['testId'];
            options.excludedKeys = ['testId'];
            options.searchValue = 'testSearchValue';
            const updatePromise = browser._beforeUpdate(options);
            browser.saveOptions(options);
            await updatePromise;

            assert.deepStrictEqual(getControllerState('testStorageId'), {
                selectedKeys: ['testId'],
                excludedKeys: ['testId'],
                searchValue: 'testSearchValue',
                expandedItems: []
            });
        });
    });

    describe('_updateSearchController', () => {
       it('filter changed if search was reset', async () => {
           const options = {
               ...getBrowserOptions(),
               searchValue: 'testSearchValue',
               filter: {
                   payload: 'something'
               }
           };
           const sourceController = new NewSourceController(options);
           let browserOptions = {
               ...options,
               sourceController
           };
           const browser = getBrowser(browserOptions);
           await browser._beforeMount(browserOptions);
           browser.saveOptions(browserOptions);

           let filter;
           browser._notify = (event, args) => {
               if (event === 'filterChanged') {
                   filter = args[0];
               }
           };
           browserOptions = {...options};
           browserOptions.searchValue = '';
           await browser._updateSearchController(browserOptions);

           assert.deepStrictEqual(filter, {payload: 'something'});
           assert.equal(browser._searchValue, '');

       });
    });

    describe('_update', () => {
       it('update without source in options', async () => {
           const options = getBrowserOptions();
           const browser = getBrowser(options);
           await browser._beforeMount(options);
           browser.saveOptions(options);
           const notifyStub = sinon.stub(browser, '_reload');
           const newOptions = {...options};
           newOptions.searchParam = 'param';
           await browser._update(options, newOptions);

           assert.isFalse(notifyStub.withArgs('filterChanged', [{payload: 'something'}]).called);

           notifyStub.restore();
       });
    });

    describe('_dataLoadCallback', () => {
        it('check direction', async () => {
            let actualDirection = null;
            const options = getBrowserOptions();
            options.dataLoadCallback = (items, direction) => {
                actualDirection = direction;
            };
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            browser._dataLoadCallback(null, 'down');
            assert.equal(actualDirection, 'down');
        });

        it('search view mode changed on dataLoadCallback', async () => {
            let options = getBrowserOptions();
            options.searchValue = 'Sash';
            const browser = await getBrowserWithMountCall(options);

            assert.ok(browser._viewMode === 'search');
            assert.ok(browser._searchValue === 'Sash');

            options = {...options};
            options.searchValue = '';
            await browser._beforeUpdate(options);
            assert.ok(browser._searchValue === '');
            assert.isUndefined(browser._getSearchControllerSync().getViewMode());
            assert.ok(browser._misspellValue === '');
        });

        it('misspellValue after search', async () => {
            let options = getBrowserOptions();
            const searchQueryMock = () => {
                const dataSet = new DataSet({
                    rawData: {
                        meta: {
                            returnSwitched: true,
                            switchedStr: 'Саша'
                        }
                    },
                    metaProperty: 'meta'
                });
                return Promise.resolve(dataSet);
            };
            const browser = new Browser();
            await browser._beforeMount(options);
            browser.saveOptions(options);

            options = {...options};
            options.searchValue = 'Cfif';
            options.source.query = searchQueryMock;
            await browser._beforeUpdate(options);
            assert.ok(browser._misspellValue === 'Саша');
            assert.ok(browser._returnedOnlyByMisspellValue);
            assert.ok(browser._searchValue === 'Cfif');
        });

        it('path is updated in searchController after load', async () => {
            const options = getBrowserOptions();
            const path = new RecordSet({
                rawData: [
                    {id: 1, title: 'folder'}
                ]
            });
            options.source.query = () => {
                const recordSet = new RecordSet();
                recordSet.setMetaData({path});
                return Promise.resolve(recordSet);
            };
            const browser = await getBrowserWithMountCall(options);
            await browser._getSearchController();
            await browser._reload(options);
            assert.ok(browser._getSearchControllerSync()._path === path);
        });

        it('dataLoadCallback in listsOptions', async () => {
            const browserOptions = getBrowserOptions();
            let listDataLoadCallbackCalled = false;
            let list2DataLoadCallbackCalled = false;
            const listsOptions = [
                {
                    id: 'list',
                    ...browserOptions
                },
                {
                    id: 'list2',
                    ...browserOptions
                }
            ];
            const options = {
                ...browserOptions,
                listsOptions,
                dataLoadCallback: (items, direction, id) => {
                    if (id === 'list') {
                        listDataLoadCallbackCalled = true;
                    }
                    if (id === 'list2') {
                        list2DataLoadCallbackCalled = true;
                    }
                }
            };
            const browser = new Browser();
            browser.saveOptions(options);
            await browser._beforeMount(options);
            assert.ok(listDataLoadCallbackCalled);
            assert.ok(list2DataLoadCallbackCalled);
        });
    });

    describe('_handleItemOpen', () => {
       it ('root is changed synchronously', async () => {
           const options = getBrowserOptions();
           const browser = getBrowser(options);
           await browser._beforeMount(options);
           browser.saveOptions(options);
           await browser._getSearchController();

           browser._handleItemOpen('test123', undefined);

           assert.equal(browser._root, 'test123');
           assert.equal(browser._getSearchControllerSync()._root, 'test123');
           assert.equal(browser._getSourceController().getRoot(), null);

           await browser._beforeUpdate(options);
           assert.equal(browser._getSourceController().getRoot(), 'test123');
       });

       it('root changed, browser is in search mode', async () => {
           const options = getBrowserOptions();
           options.parentProperty = 'parentProperty';
           const browser = getBrowser(options);
           await browser._beforeMount(options);
           browser.saveOptions(options);
           await browser._search(null, 'testSearchValue');

           browser._handleItemOpen('testRoot', undefined);
           assert.ok(!browser._inputSearchValue);
           assert.equal(browser._root, 'testRoot');
           assert.deepStrictEqual(browser._filter, {parentProperty: null});
       });

       it('root changed, saved root in searchController is reseted', async () => {
            let options = getBrowserOptions();
            options.parentProperty = 'parentProperty';
            options.root = 'rootBeforeSearch';
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            await browser._search(null, 'testSearchValue');
            browser._handleItemOpen('testRoot', undefined);
            options = {...options};
            options.root = 'testRoot';
            await browser._beforeUpdate(options);
            assert.equal(browser._root, 'testRoot');
        });

       it ('root is changed, shearchController is not created', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            browser._handleItemOpen('test123', undefined, 'test123');

            assert.equal(browser._root, 'test123');
        });

       it ('root is in options', async () => {
            const options = {...getBrowserOptions(), root: 'testRoot'};
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            await browser._getSearchController();
            browser._handleItemOpen('test123', undefined, 'test123');

            assert.equal(browser._root, 'testRoot');
        });
    });

    describe('_afterSearch', () => {
        it('filter updated', async () => {
            const filter = {
                title: 'test'
            };
            const resultFilter = {
                title: 'test',
                testSearchParam: 'test'
            };
            const options = {...getBrowserOptions(), searchParam: 'testSearchParam', searchValue: 'testSearchValue', filter};
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            await browser._search(null, 'test');

            assert.deepEqual(browser._filter, resultFilter);
            assert.deepEqual(browser._sourceControllerState.filter, resultFilter);
        });
    });

    it('resetPrefetch', async () => {
        const filter = {
            testField: 'testValue',
            PrefetchSessionId: 'test'
        };
        await import('Controls/filter');
        let options = {...getBrowserOptions(), filter};
        const browser = getBrowser(options);
        await browser._beforeMount(options);
        browser.saveOptions(options);

        options = {...options};
        options.source = new Memory();
        const loadPromise = browser._beforeUpdate(options);

        browser.resetPrefetch();
        assert.ok(!!browser._filter.PrefetchSessionId);

        await loadPromise;
        browser.resetPrefetch();
        assert.ok(!browser._filter.PrefetchSessionId);
    });

});
