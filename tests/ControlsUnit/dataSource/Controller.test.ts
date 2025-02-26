import {NewSourceController, ISourceControllerOptions} from 'Controls/dataSource';
import {Memory, PrefetchProxy, DataSet, HierarchicalMemory} from 'Types/source';
import {ok, deepStrictEqual} from 'assert';
import {RecordSet} from 'Types/collection';
import {adapter} from 'Types/entity';
import {INavigationPageSourceConfig, INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';
import {createSandbox, stub, useFakeTimers} from 'sinon';
import {default as groupUtil} from 'Controls/_dataSource/GroupUtil';

const filterByEntries = (item, filter): boolean => {
    return filter.entries ? filter.entries.get('marked').includes(String(item.get('key'))) : true;
};

const filterByRoot = (item, filter): boolean => {
    return item.get('parent') === filter.parent;
};

const items = [
    {
        key: 0,
        title: 'Sasha'
    },
    {
        key: 1,
        title: 'Dmitry'
    },
    {
        key: 2,
        title: 'Aleksey'
    },
    {
        key: 3,
        title: 'Aleksey'
    }
];

const hierarchyItems = [
    {
        key: 0,
        title: 'Интерфейсный фреймворк',
        parent: null,
        hasChildren: true
    },
    {
        key: 1,
        title: 'Sasha',
        parent: 0,
        hasChildren: false
    },
    {
        key: 2,
        title: 'Dmitry',
        parent: 0,
        hasChildren: false
    },
    {
        key: 3,
        title: 'Склад',
        parent: null,
        hasChildren: true
    },
    {
        key: 4,
        title: 'Michail',
        parent: 3,
        hasChildren: false
    },
    {
        key: 5,
        title: 'Платформа',
        parent: null,
        hasChildren: false
    }
];

function getMemory(additionalOptions: object = {}): Memory {
    const options = {
        data: items,
        keyProperty: 'key'
    };
    return new Memory({...options, ...additionalOptions});
}

function getPrefetchProxy(): PrefetchProxy {
    return new PrefetchProxy({
        target: getMemory(),
        data: {
            query: new DataSet({
                rawData: items.slice(0, 2),
                keyProperty: 'key'
            })
        }
    });
}

function getControllerOptions(): ISourceControllerOptions {
    return {
        source: getMemory(),
        filter: {},
        keyProperty: 'key'
    };
}

function getControllerWithHierarchyOptions(): ISourceControllerOptions {
    return {
        source: getMemoryWithHierarchyItems(),
        parentProperty: 'parent',
        filter: {},
        keyProperty: 'key'
    };
}

function getMemoryWithHierarchyItems(): Memory {
    return new Memory({
        data: hierarchyItems,
        keyProperty: 'key',
        filter: filterByEntries
    });
}

function getPagingNavigation(hasMore: boolean = false, pageSize: number = 1)
    : INavigationOptionValue<INavigationPageSourceConfig> {
    return {
        source: 'page',
        sourceConfig: {
            pageSize,
            page: 0,
            hasMore
        }
    };
}

const sourceWithError = new Memory();
sourceWithError.query = () => {
    const error = new Error();
    error.processed = true;
    return Promise.reject(error);
};

function getControllerWithHierarchy(additionalOptions: object = {}): NewSourceController {
    return new NewSourceController({...getControllerWithHierarchyOptions(), ...additionalOptions});
}

function getController(additionalOptions: object = {}): NewSourceController {
    return new NewSourceController({...getControllerOptions(), ...additionalOptions});
}

describe('Controls/dataSource:SourceController', () => {

    describe('getState', () => {
        it('getState after create controller', () => {
            const root = 'testRoot';
            const parentProperty = 'testParentProperty';
            let hierarchyOptions;
            let controller;
            let controllerState;

            hierarchyOptions = {
                root,
                parentProperty
            };
            controller = new NewSourceController(hierarchyOptions);
            controllerState = controller.getState();
            ok(controllerState.parentProperty === parentProperty);
            ok(controllerState.root === root);
            ok(!controllerState.keyProperty);

            hierarchyOptions = {
                parentProperty,
                source: new Memory({
                    keyProperty: 'testKeyProperty'
                })
            };
            controller = new NewSourceController(hierarchyOptions);
            controllerState = controller.getState();
            ok(controllerState.parentProperty === parentProperty);
            ok(controllerState.root === null);
            ok(controllerState.keyProperty === 'testKeyProperty');
        });

        it('without expandedItems in options', () => {
            const controller = getControllerWithHierarchy();
            controller.setExpandedItems(['testKey1']);
            ok(!controller.getState().expandedItems);
        });

        it('expandedItems in options', () => {
            const controller = getControllerWithHierarchy({
                expandedItems: []
            });
            controller.setExpandedItems(['testKey1']);
            deepStrictEqual(controller.getState().expandedItems, ['testKey1']);
        });
    });

    describe('load', () => {

        it('load with parentProperty',  async () => {
            const controller = getControllerWithHierarchy();
            const loadedItems = await controller.load();
            ok((loadedItems as RecordSet).getCount() === 6);
        });

        it('load with direction "down"',  async () => {
            const controller  = getController();
            await controller.load('down');
            ok(controller.getItems().getCount() === 4);
        });

        it('load without direction',  async () => {
            const controller = getControllerWithHierarchy({
                navigation: getPagingNavigation()
            });
            await controller.reload();
            await controller.load(undefined, 3);
            ok(controller.hasLoaded(3));

            await controller.load();
            ok(!controller.hasLoaded(3));
        });

        it('load call while loading',  async () => {
            const controller = getController();
            let loadPromiseWasCanceled = false;

            const promiseCanceled = controller.load().catch(() => {
                loadPromiseWasCanceled = true;
            });

            await controller.load();
            await promiseCanceled;
            ok(loadPromiseWasCanceled);
        });

        it('load call while preparing filter', async () => {
            return new Promise((resolve) => {
                const navigation = getPagingNavigation();
                let navigationParamsChangedCallbackCalled = false;
                const options = {...getControllerOptions(), navigation};
                options.navigationParamsChangedCallback = () => {
                    navigationParamsChangedCallbackCalled = true;
                };
                const controller = getController(options);

                const reloadPromise = controller.reload();
                controller.cancelLoading();
                reloadPromise.finally(() => {
                    ok(!navigationParamsChangedCallbackCalled);
                    resolve();
                });
            });
        });

        it('load with parentProperty and selectedKeys',  async () => {
            let controller = getControllerWithHierarchy({
                selectedKeys: [0],
                excludedKeys: []
            });
            let loadedItems = await controller.load();
            ok((loadedItems as RecordSet).getCount() === 1);

            controller = getControllerWithHierarchy({
                selectedKeys: [0]
            });
            loadedItems = await controller.load();
            ok((loadedItems as RecordSet).getCount() === 1);
        });

        it('load with prefetchProxy in options',  async () => {
            const controller = getController({
                source: getPrefetchProxy(),
                navigation: {
                    source: 'page',
                    sourceConfig: {
                        pageSize: 2,
                        hasMore: false
                    }
                }
            });

            let loadedItems = await controller.load();
            ok((loadedItems as RecordSet).getCount() === 2);
            ok((loadedItems as RecordSet).at(0).get('title') === 'Sasha');

            loadedItems = await controller.load('down');
            ok((loadedItems as RecordSet).getCount() === 2);
            ok((loadedItems as RecordSet).at(0).get('title') === 'Aleksey');
        });

        it('load call with direction update items',  async () => {
            const controller = getController({
                navigation: {
                    source: 'page',
                    sourceConfig: {
                        pageSize: 2,
                        hasMore: false
                    }
                }
            });

            await controller.load();
            ok(controller.getItems().getCount() === 2);
            ok(controller.getItems().at(0).get('title') === 'Sasha');

            await controller.load('down');
            ok(controller.getItems().getCount() === 4);
            ok(controller.getItems().at(2).get('title') === 'Aleksey');
        });

        it('load with root in arguments and deepReload, expandedItems in options',  async () => {
            const controller = getController({
                navigation: {
                    source: 'page',
                    sourceConfig: {
                        pageSize: 2,
                        hasMore: false
                    }
                },
                source: new Memory({
                    keyProperty: 'key',
                    data: hierarchyItems,
                    filter: filterByRoot
                }),
                parentProperty: 'parent',
                deepReload: true,
                expandedItems: [3]
            });

            await controller.load(null, 0);
            ok(controller.getItems().getCount() === 2);

            await controller.load('down');
            ok(controller.getItems().getCount() === 3);
        });

        it('load with multiNavigation',  async () => {
            const pageSize = 3;
            const allItemsCount = 4;
            const navigation = getPagingNavigation(false, pageSize);
            navigation.sourceConfig.multiNavigation = true;
            const controller = getController({...getControllerOptions(), navigation});
            const loadedItems = await controller.reload();
            ok((loadedItems as RecordSet).getCount() === pageSize);

            await controller.load('down');
            ok(controller.getItems().getCount() === allItemsCount);

            await controller.reload();
            ok(controller.getItems().getCount() === allItemsCount);

            await controller.reload({
                multiNavigation: true
            } as INavigationSourceConfig);
            ok(controller.getItems().getCount() === pageSize);

            await controller.reload({
                page: 0,
                pageSize
            });
            ok(controller.getItems().getCount() === pageSize);
        });

        it('load with multiNavigation and parentProperty',  async () => {
            const pageSize = 3;
            const navigation = getPagingNavigation(false, pageSize);
            navigation.sourceConfig.multiNavigation = true;
            const controller = getControllerWithHierarchy({navigation});
            const loadedItems = await controller.reload();
            ok((loadedItems as RecordSet).getCount() === pageSize);
            await controller.reload();
            ok(controller.getItems().getCount() === pageSize);
        });

        it('load with multiNavigation and without expandedItems',  async () => {
            const pageSize = 3;
            const navigation = getPagingNavigation(false, pageSize);
            navigation.sourceConfig.multiNavigation = true;
            const controller = getController({...getControllerOptions(), navigation});
            const loadedItems = await controller.reload();
            ok((loadedItems as RecordSet).getCount() === pageSize);
            ok(controller.hasMoreData('down'));
        });

        it('load with multiNavigation, parentProperty, expandedItems as [null]',  async () => {
            const pageSize = 3;
            const navigation = getPagingNavigation(false, pageSize);
            navigation.sourceConfig.multiNavigation = true;
            const controller = getControllerWithHierarchy({navigation, expandedItems: [null]});
            const loadedItems = await controller.reload();
            ok((loadedItems as RecordSet).getCount() === pageSize);
            await controller.reload();
            ok(controller.getItems().getCount() === pageSize);
        });

        it('load with dataLoadCallback in options',  async () => {
            let dataLoadCallbackCalled = false;
            const controller = getController({
                dataLoadCallback: () => {
                    dataLoadCallbackCalled = true;
                }
            });
            await controller.load();
            ok(dataLoadCallbackCalled);
        });

        it('load with dataLoadCallback from setter',  async () => {
            let dataLoadCallbackCalled = false;
            const controller = getController();
            controller.setDataLoadCallback(() => {
                dataLoadCallbackCalled = true;
            });
            await controller.load();
            ok(dataLoadCallbackCalled);
        });

        it('load any root with dataLoadCallback from setter',  async () => {
            let dataLoadCallbackCalled = false;
            const controller = getController();
            controller.setDataLoadCallback(() => {
                dataLoadCallbackCalled = true;
            });
            await controller.load(null, 'testRoot');
            ok(!dataLoadCallbackCalled);

            await controller.load('down', 'testRoot');
            ok(!dataLoadCallbackCalled);
        });

        it('dataLoadCallback from setter returns promise',  async () => {
            const controller = getController();
            let promiseResolver;

            const promise = new Promise((resolve) => {
                promiseResolver = resolve;
            });
            controller.setDataLoadCallback(() => {
                return promise;
            });
            const reloadPromise = controller.reload().then(() => {
                ok(controller.getItems().getCount() === 4);
            });
            promiseResolver();
            await reloadPromise;
        });

        it('load with nodeLoadCallback in options',  async () => {
            let nodeLoadCallbackCalled = false;
            const controller = getController({
                nodeLoadCallback: () => {
                    nodeLoadCallbackCalled = true;
                }
            });
            await controller.load();
            ok(!nodeLoadCallbackCalled);

            await controller.load(void 0, 'testRoot');
            ok(nodeLoadCallbackCalled);

            nodeLoadCallbackCalled = false;
            await controller.load('down', 'testRoot');
            ok(nodeLoadCallbackCalled);
        });

        it('load with direction returns error',  () => {
            const navigation = getPagingNavigation();
            let options = {...getControllerOptions(), navigation};
            const controller = getController(options);
            return controller.reload().then(() => {
                ok(controller.getItems().getCount() === 1);
                // mock error
                const originSource = controller._options.source;
                options = {...options};
                options.source = sourceWithError;
                controller.updateOptions(options);

                return controller.load('down').catch(() => {
                    ok(controller.getItems().getCount() === 1);
                    ok(controller.getLoadError() instanceof Error);

                    // return originSource
                    options = {...options};
                    options.source = originSource;
                    controller.updateOptions(options);
                    return controller.load('down').then(() => {
                        ok(controller.getItems().getCount() === 2);
                    });
                });
            });
        });

        it('load timeout error',  () => {
            const options = getControllerOptions();
            options.loadTimeout = 10;
            options.source.query = () => {
                return new Promise((resolve) => {
                   setTimeout(resolve, 100);
                });
            };
            const controller = getController(options);
            return controller.load().catch((error) => {
                ok(error.status === 504);
            });
        });

        it('load with selectFields', async () => {
            const options = getControllerOptions();
            options.selectFields = ['key'];
            const controller = getController(options);
            await controller.reload();
            ok(controller.getItems().at(0).get('key') !== undefined);
            ok(controller.getItems().at(0).get('title') === undefined);
        });

        it('load with selectFields and navigation', async () => {
            const options = getControllerOptions();
            options.navigation = getPagingNavigation();
            options.selectFields = ['key'];
            const controller = getController(options);
            await controller.reload();
            ok(controller.getItems().at(0).get('key') !== undefined);
            ok(controller.getItems().at(0).get('title') === undefined);
        });

        it('dataLoad event', async () => {
            const options = getControllerOptions();
            const controller = getController(options);
            let dataLoadEventFired = false;
            await controller.reload();

            controller.subscribe('dataLoad', () => {
                dataLoadEventFired = true;
            });

            await controller.load();
            ok(dataLoadEventFired);

            dataLoadEventFired = false;
            await controller.load('down', 'testKey');
            ok(!dataLoadEventFired);
        });
    });

    describe('cancelLoading', () => {
        it('query is canceled after cancelLoading',   () => {
            const controller = getController();

            controller.load();
            ok(controller.isLoading());

            controller.cancelLoading();
            ok(!controller.isLoading());
        });

        it('query is canceled async', async () => {
            const controller = getController();
            const loadPromise = controller.load();

            controller._loadPromise.cancel();
            await loadPromise.catch(() => {/* FIXME: sinon mock */});

            ok(controller._loadPromise);
        });
    });

    describe('updateOptions', () => {
        it('updateOptions with root',  async () => {
            const controller = getControllerWithHierarchy();
            let options = {...getControllerWithHierarchyOptions()};
            let isChanged;
            options.root = 'testRoot';

            isChanged = controller.updateOptions(options);
            ok(controller._root === 'testRoot');
            ok(isChanged);

            options = {...options};
            options.root = undefined;
            isChanged = controller.updateOptions(options);
            ok(controller._root === 'testRoot');
            ok(!isChanged);
        });

        it('updateOptions with navigationParamsChangedCallback',  async () => {
            let isNavigationParamsChangedCallbackCalled = false;
            const navigation = getPagingNavigation();
            const controller = getController({
                navigation
            });
            await controller.reload();
            ok(!isNavigationParamsChangedCallbackCalled);

            controller.updateOptions({
                ...getControllerOptions(),
                navigation,
                navigationParamsChangedCallback: () => {
                    isNavigationParamsChangedCallbackCalled = true;
                }
            });
            await controller.reload();
            ok(isNavigationParamsChangedCallbackCalled);

            controller.updateOptions({
                ...getControllerOptions(),
                navigation: getPagingNavigation()
            });
            isNavigationParamsChangedCallbackCalled = false;
            await controller.reload();
            ok(isNavigationParamsChangedCallbackCalled);
        });

        it('updateOptions with new sorting',  async () => {
            let controllerOptions = getControllerOptions();
            controllerOptions.sorting = [{testField: 'DESC'}];
            const controller = getController(controllerOptions);

            // the same sorting
            controllerOptions = {...controllerOptions};
            controllerOptions.sorting = [{testField: 'DESC'}];
            ok(!controller.updateOptions(controllerOptions));

            // another sorting
            controllerOptions = {...controllerOptions};
            controllerOptions.sorting = [{testField: 'ASC'}];
            ok(controller.updateOptions(controllerOptions));

            // sorting is plain object
            controllerOptions = {...controllerOptions};
            controllerOptions.sorting = {testField: 'ASC'};
            ok(controller.updateOptions(controllerOptions));

            controllerOptions = {...controllerOptions};
            delete controllerOptions.sorting;
            ok(!controller.updateOptions(controllerOptions));
        });

        it('updateOptions with new filter',  async () => {
            let controllerOptions = getControllerOptions();
            controllerOptions.filter = [{filed1: 'value1'}];
            const controller = getController(controllerOptions);

            // the same filter
            controllerOptions = {...controllerOptions};
            controllerOptions.filter = [{filed1: 'value1'}];
            ok(!controller.updateOptions(controllerOptions));

            // another filter
            controllerOptions = {...controllerOptions};
            controllerOptions.filter = [{field2: 'value2'}];
            ok(controller.updateOptions(controllerOptions));
        });
    });

    describe('expandedItems in options', () => {
        it('updateOptions with expandedItems',  async () => {
            const controller = getControllerWithHierarchy();
            let options = {...getControllerWithHierarchyOptions()};

            options.expandedItems = [];
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), []);

            options = {...options};
            options.expandedItems = ['testRoot'];
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), ['testRoot']);

            options = {...options};
            delete options.expandedItems;
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), ['testRoot']);
        });

        it('reset expandedItems on options change',  async () => {
            let options = {...getControllerWithHierarchyOptions()};
            options.expandedItems = ['testRoot'];
            const controller = getControllerWithHierarchy(options);

            deepStrictEqual(controller.getExpandedItems(), ['testRoot']);

            options = {...options};
            controller.updateOptions(options);
            // Если проставлен флаг deepReload, то expandedItems не сбросятся
            deepStrictEqual(controller.getExpandedItems(), ['testRoot']);

            // флаг deepReload сбросится только после перезагрузки
            await controller.reload();

            options = {...options};
            options.root = 'testRoot';
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), []);

            controller.setExpandedItems(['testRoot']);
            options = {...options};
            options.filter = {newFilterField: 'newFilterValue'};
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), []);

            options = {...options};
            options.deepReload = true;
            controller.updateOptions(options);
            controller.setExpandedItems(['testRoot']);
            options = {...options};
            options.root = 'testRoot2';
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), []);
        });

        it('expandedItems is [null]',  async () => {
            let options = {...getControllerWithHierarchyOptions()};
            options.source = new Memory({
                data: hierarchyItems,
                keyProperty: 'key',
                filter: filterByRoot
            });
            options.expandedItems = [null];
            options.root = null;
            const controller = getController(options);

            deepStrictEqual(controller.getExpandedItems(), [null]);

            options = {...options};
            options.filter = {newFilterField: 'newFilterValue'};
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), [null]);

            await controller.reload();
            ok(controller.getItems().getCount() === 3);
        });
    });

    it('error in options', () => {
        const sourceControllerOptions = getControllerOptions();
        sourceControllerOptions.error = new Error();
        const sourceController =  new NewSourceController(sourceControllerOptions);
        ok(sourceController.getLoadError() instanceof Error);
    });

    describe('reload', () => {
        it('reload should recreate navigation controller',  async () => {
            const controller = getController({
                navigation: getPagingNavigation(false)
            });
            const itemsRS = await controller.reload();
            controller.setItems(itemsRS as RecordSet);

            const controllerDestroyStub = stub(controller._navigationController, 'destroy');
            await controller.reload();
            ok(controllerDestroyStub.calledOnce);
        });
    });

    describe('setItems', () => {

        it('navigationController is recreated on setItems', () => {
            const controller = getController({
                navigation: getPagingNavigation(true)
            });
            controller.setItems(new RecordSet({
                rawData: items,
                keyProperty: 'key'
            }));
            const controllerDestroyStub = stub(controller._navigationController, 'destroy');

            controller.setItems(new RecordSet({
                rawData: items,
                keyProperty: 'key'
            }));
            ok(controllerDestroyStub.calledOnce);
        });

        it('navigation is updated before assign items', () => {
            const controller = getController({
                navigation: getPagingNavigation(true)
            });
            controller.setItems(new RecordSet({
                rawData: items,
                keyProperty: 'key'
            }));
            const controllerItems = controller.getItems();

            let hasMoreResult;
            controllerItems.subscribe('onCollectionChange', () => {
                hasMoreResult = controller.hasMoreData('down');
            });

            let newControllerItems = controllerItems.clone();
            newControllerItems.setMetaData({
                more: false
            });
            controller.setItems(newControllerItems);
            ok(!hasMoreResult);

            newControllerItems = controllerItems.clone();
            newControllerItems.setMetaData({
                more: true
            });
            controller.setItems(newControllerItems);
            ok(hasMoreResult);
        });

        describe('different items format', () => {
            it('items with same format', () => {
                const controller = getController();
                const items = new RecordSet({
                    adapter: new adapter.Sbis(),
                    rawData: {
                        d: [['1']],
                        s: [{n: 'testName', t: 'string'}]
                    },
                    format: [
                        { name: 'testName', type: 'string' }
                    ],
                    keyProperty: 'id'
                });
                const itemsWithSameFormat = new RecordSet({
                    adapter: new adapter.Sbis(),
                    rawData: {
                        d: [['1']],
                        s: [{n: 'testName', t: 'string'}]
                    },
                    format: [
                        { name: 'testName', type: 'string' }
                    ],
                    keyProperty: 'id'
                });

                controller.setItems(items);
                controller.setItems(itemsWithSameFormat);
                ok(controller.getItems() === items);
            });

            it('items with different format', () => {
                const items = new RecordSet({
                    adapter: new adapter.Sbis(),
                    rawData: {
                        d: [['1']],
                        s: [{n: 'testName', t: 'string'}]
                    },
                    format: [
                        { name: 'testName', type: 'string' }
                    ],
                    keyProperty: 'id'
                });
                const otherItems = new RecordSet({
                    adapter: new adapter.Sbis(),
                    rawData: {
                        d: [['1']],
                        s: [{n: 'testName2', t: 'string'}]
                    },
                    format: [
                        { name: 'testName2', type: 'string' }
                    ],
                    keyProperty: 'id'
                });
                const controller = getController();

                controller.setItems(items);
                controller.setItems(otherItems);
                ok(controller.getItems() === otherItems);
            });

            it('empty items', () => {
                const items = new RecordSet({
                    adapter: new adapter.Sbis(),
                    rawData: {
                        d: [],
                        s: []
                    },
                    format: [],
                    keyProperty: 'id'
                });
                const otherItems = new RecordSet({
                    adapter: new adapter.Sbis(),
                    rawData: {
                        d: [['1']],
                        s: [{n: 'testName2', t: 'string'}]
                    },
                    format: [
                        { name: 'testName2', type: 'string' }
                    ],
                    keyProperty: 'id'
                });
                const controller = getController();

                controller.setItems(items);
                controller.setItems(otherItems);
                ok(controller.getItems() === items);
            });

        });

        it('setItems with multinavigation', () => {
            const navigation = getPagingNavigation(true);
            navigation.sourceConfig.multiNavigation = true;
            const controller = getControllerWithHierarchy({navigation});
            const items = new RecordSet();
            const navRecordSet = new RecordSet({
                keyProperty: 'id',
                rawData: [{
                    id: 'Приход',
                    nav_result: true
                }, {
                    id: 'Расход',
                    nav_result: false
                }]
            });
            items.setMetaData({more: navRecordSet});
            controller.setItems(items);
            ok(controller.hasLoaded('Приход'));
            ok(controller.hasLoaded('Расход'));
        });

    });

    describe('getKeyProperty', () => {

        it('keyProperty in options', () => {
            const options = {
                source: new Memory({
                    keyProperty: 'testKeyProperty'
                })
            };
            const sourceController = new NewSourceController(options);
            ok(sourceController.getKeyProperty() === 'testKeyProperty');
        });

        it('keyProperty from source', () => {
            const options = {
                source: new Memory(),
                keyProperty: 'testKeyProperty'
            };
            const sourceController = new NewSourceController(options);
            ok(sourceController.getKeyProperty() === 'testKeyProperty');
        });

    });

    describe('hasMoreData', () => {
        it('hasMoreData for root', async () => {
            const controller = getController({
                navigation: getPagingNavigation(false)
            });
            await controller.reload();
            ok(controller.hasMoreData('down'));
        });

        it('hasMoreData for not loaded folder', async () => {
            const controller = getController({
                navigation: getPagingNavigation(false)
            });
            ok(!controller.hasMoreData('down', 'anyFolderKey'));
            ok(!controller.hasLoaded('anyFolderKey'));
        });
    });

    describe('hasLoaded', () => {
        it('hasLoaded without navigation', async () => {
            const controller = getController({
                parentProperty: 'anyProp'
            });
            controller.setExpandedItems(['anyTestKey']);
            await controller.reload();
            ok(controller.hasLoaded('anyTestKey'));
        });

        it('hasLoaded without navigation, but all items loaded', async () => {
            const source = new Memory({
                data: hierarchyItems,
                keyProperty: 'key',
                filter: () => true
            });
            const controller = getControllerWithHierarchy({source});
            await controller.reload();
            ok(controller.hasLoaded(0));
        });

        it('hasLoaded with navigation', async () => {
            const controller = getController({
                navigation: getPagingNavigation(false)
            });
            ok(!controller.hasLoaded('anyFolderKey'));
        });

        it('hasLoaded with hasChildrenProperty', async () => {
            const controller = getControllerWithHierarchy({
                hasChildrenProperty: 'hasChildren',
                root: null,
                source: new HierarchicalMemory({
                    data: hierarchyItems,
                    keyProperty: 'key',
                    parentProperty: 'parent'
                })
            });
            await controller.reload();
            ok(!controller.hasLoaded(0));
            ok(controller.hasLoaded(5));
        });
    });

    describe('collapsedGroups', () => {
        it('initialize with groupHistoryId',  async () => {
            const sinonSandbox = createSandbox();
            const storedCollapsedGroups = ['testCollapsedGroup1', 'testCollapsedGroup2'];
            sinonSandbox.replace(groupUtil, 'restoreCollapsedGroups', () => {
                return Promise.resolve(storedCollapsedGroups);
            });
            const controller = await getController({
                source: getMemory({
                    filter: (item, filter) => filter.myFilterField
                }),
                filter: {
                    myFilterField: 'myFilterFieldValue'
                },
                groupProperty: 'groupProperty',
                groupHistoryId: 'groupHistoryId'
            });

            ok(controller.getCollapsedGroups(), storedCollapsedGroups);
            sinonSandbox.restore();
        });

        it('update with new groupHistoryId',  async () => {
            const sinonSandbox = createSandbox();
            const storedCollapsedGroups = ['testCollapsedGroup1', 'testCollapsedGroup2'];
            sinonSandbox.replace(groupUtil, 'restoreCollapsedGroups', (storeKey: string) => {
                return Promise.resolve(storeKey === 'newGroupHistoryId' ?  storedCollapsedGroups : undefined);
            });
            const controller = getController({
                source: getMemory({
                    filter: (item, filter) => filter.myFilterField
                }),
                filter: {
                    myFilterField: 'myFilterFieldValue'
                },
                groupProperty: 'groupProperty',
                groupHistoryId: 'groupHistoryId'
            });

            const options = getControllerOptions();
            await controller.updateOptions({...options, groupHistoryId: 'newGroupHistoryId'});
            ok(controller.getCollapsedGroups(), storedCollapsedGroups);
            sinonSandbox.restore();
        });
    });

    describe('setRoot', () => {
        it('root is changed after setRoot', () => {
            const controller = getController();
            controller.setRoot('testRoot');
            ok(controller.getRoot() === 'testRoot');
        });

        it('rootChanged event fired on setRoot', () => {
            let rootChangedEventFired = false;
            const controller = getController();
            controller.subscribe('rootChanged', () => {
                rootChangedEventFired = true;
            });

            controller.setRoot('testRoot');
            ok(rootChangedEventFired);

            // same root
            rootChangedEventFired = false;
            controller.setRoot('testRoot');
            ok(!rootChangedEventFired);
        });
    });
});
