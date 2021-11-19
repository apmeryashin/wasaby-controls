import {DataLoader, ILoadDataResult, ILoadDataConfig, ILoadDataCustomConfig, IDataLoaderOptions} from 'Controls/dataSource';
import {Memory, PrefetchProxy} from 'Types/source';
import {ok, deepStrictEqual} from 'assert';
import {NewSourceController} from 'Controls/dataSource';
import {createSandbox, useFakeTimers} from 'sinon';
import {default as groupUtil} from 'Controls/_dataSource/GroupUtil';
import {RecordSet} from 'Types/collection';
import {HTTPStatus} from 'Browser/Transport';
import {Logger} from 'UI/Utils';
import {assert} from 'chai';

function getDataArray(): object[] {
    return [
        {
            id: 0,
            title: 'Sasha'
        },
        {
            id: 1,
            title: 'Sergey'
        },
        {
            id: 2,
            title: 'Dmitry'
        },
        {
            id: 3,
            title: 'Andrey'
        },
        {
            id: 4,
            title: 'Aleksey'
        }
    ];
}

function getSource(): Memory {
    return new Memory({
        data: getDataArray(),
        keyProperty: 'id'
    });
}

function getDataLoader(dataLoaderOptions?: IDataLoaderOptions): DataLoader {
    return new DataLoader(dataLoaderOptions);
}

describe('Controls/dataSource:loadData', () => {

    it('loadData', async () => {
        const loadDataConfig = {
            source: getSource()
        };
        const loadDataResult = await getDataLoader().load([loadDataConfig]);

        ok(loadDataResult.length === 1);
        ok(loadDataResult[0].data.getCount() === 5);
        deepStrictEqual(loadDataResult[0].data.getRawData(), getDataArray());
    });

    it('loadData with filter', async () => {
        const loadDataConfig = {
            source: getSource(),
            filter: {
                title: 'Sasha'
            }
        };
        const loadDataResult = await getDataLoader().load([loadDataConfig]);

        ok(loadDataResult.length === 1);
        ok(loadDataResult[0].data.getCount() === 1);
    });

    it('loadData with several configs', async () => {
        const loadDataConfig = {
            source: getSource()
        };
        const loadDataConfigWithFilter = {
            source: getSource(),
            filter: {
                title: 'Sasha'
            }
        };
        const loadDataResult = await getDataLoader().load([loadDataConfig, loadDataConfigWithFilter]);

        ok(loadDataResult.length === 2);
        ok(loadDataResult[0].data.getCount() === 5);
        ok(loadDataResult[1].data.getCount() === 1);
    });

    it('loadData with filterButtonSource', async () => {
        const loadDataConfigWithFilter = {
            type: 'list',
            source: getSource(),
            filter: {},
            filterButtonSource: [
                {
                    name: 'title', value: 'Sasha', textValue: 'Sasha'
                }
            ]
        } as ILoadDataConfig;
        const dataLoader = getDataLoader();
        const loadDataResult = await dataLoader.load<ILoadDataResult>([loadDataConfigWithFilter]);
        const filterController = dataLoader.getFilterController();

        ok(loadDataResult.length === 1);
        ok((loadDataResult[0]).data.getCount() === 1);
        ok(filterController !== filterController._options.filterController);
        deepStrictEqual(
            (loadDataResult[0]).filter,
            {
                title: 'Sasha'
            }
        );
        deepStrictEqual(
            (loadDataResult[0]).filterController.getFilter(),
            {
                title: 'Sasha'
            }
        );
    });

    it('load with custom loader', async () => {
        const loadDataConfigCustomLoader = {
            type: 'custom',
            loadDataMethod: () => Promise.resolve({ testField: 'testValue', historyItems: [] })
        } as ILoadDataCustomConfig;
        const loadDataResult = await getDataLoader().load([loadDataConfigCustomLoader]);

        ok(loadDataResult.length === 1);
        deepStrictEqual(loadDataResult[0], { testField: 'testValue', historyItems: [] });
    });

    it('custom loader returns primitive value', async () => {
        const loadDataConfigCustomLoader = {
            type: 'custom',
            loadDataMethod: () => Promise.resolve(false)
        } as ILoadDataCustomConfig;
        const loadDataResult = await getDataLoader().load([loadDataConfigCustomLoader]);

        ok(loadDataResult.length === 1);
        ok(loadDataResult[0] === false);
    });

    it('load with custom loader (promise rejected)', async () => {
        const loadDataConfigCustomLoader = {
            type: 'custom',
            loadDataMethod: () => Promise.reject({ testField: 'testValue', historyItems: [] })
        } as ILoadDataCustomConfig;
        const loadDataResult = await getDataLoader().load([loadDataConfigCustomLoader]);

        ok(loadDataResult.length === 1);
        deepStrictEqual(loadDataResult[0], { testField: 'testValue', historyItems: [] });
    });

    it('load with filterHistoryLoader', async () => {
        const historyItem = {
            name: 'title', value: 'Sasha', textValue: 'Sasha'
        };
        const loadDataConfigCustomLoader = {
            type: 'list',
            source: getSource(),
            filter: {},
            filterButtonSource: [
                {
                    name: 'title', value: '', textValue: ''
                }
            ],
            filterHistoryLoader: () => Promise.resolve({
                historyItems: [{...historyItem}],
                filter: {
                    city: 'Yaroslavl'
                }
            })
        };
        const loadDataResult = await getDataLoader().load([loadDataConfigCustomLoader]);

        deepStrictEqual(
            (loadDataResult[0] as ILoadDataResult).filter,
            {
                title: 'Sasha',
                city: 'Yaroslavl'
            }
        );
        deepStrictEqual(loadDataResult[0].historyItems, [{...historyItem}]);
    });

    it('loadEvery', async () => {
        const loadDataConfigs = [{source: getSource()}, {source: getSource()}];
        const loadDataPromises = getDataLoader().loadEvery(loadDataConfigs);
        const loadResults = await Promise.all(loadDataPromises);

        ok(loadDataPromises.length === 2);
        ok(loadResults.length === 2);
    });

    it('loadEvery with config in constructor', async () => {
        const loadDataConfigs = [{source: getSource()}, {source: getSource()}];
        const loadDataPromises = getDataLoader({loadDataConfigs}).loadEvery();
        const loadResults = await Promise.all(loadDataPromises);

        ok(loadDataPromises.length === 2);
        ok(loadResults.length === 2);
    });

    it('load data with sourceController in config', async () => {
        const source = getSource();
        const sourceController = new NewSourceController({source});
        const dataLoader = getDataLoader();
        await dataLoader.load([{source, sourceController}]);

        ok(dataLoader.getSourceController() === sourceController);
    });

    it('load data with sourceController and prefetchProxy in config', async () => {
        const source = getSource();
        const rs = new RecordSet({
            rawData: getDataArray()
        });
        const prefetchSource = new PrefetchProxy({
            target: source,
            data: {
                query: rs
            }
        });
        const sourceController = new NewSourceController({source});
        const dataLoader = getDataLoader();
        await dataLoader.load([{source: prefetchSource, sourceController}]);

        ok(dataLoader.getSourceController().getItems() === rs);
    });

    it('load with collapsedGroups', async () => {
        const sinonSandbox = createSandbox();
        const loadDataConfigWithFilter = {
            source: getSource(),
            filter: {},
            groupHistoryId: 'testGroupHistoryId'
        };

        sinonSandbox.replace(groupUtil, 'restoreCollapsedGroups', () => {
            return Promise.resolve(['testCollapsedGroup1', 'testCollapsedGroup2']);
        });
        const loadDataResult = await getDataLoader().load([loadDataConfigWithFilter]);
        deepStrictEqual((loadDataResult[0] as ILoadDataResult).collapsedGroups, ['testCollapsedGroup1', 'testCollapsedGroup2']);
        sinonSandbox.restore();
    });

    it('load with searchValue and searchParam', async () => {
        const loadDataConfigWithFilter = {
            source: getSource(),
            filter: {},
            searchParam: 'title',
            searchValue: 'Sasha',
            minSearchLength: 3
        };

        const dataLoader = getDataLoader();
        const loadDataResult = await dataLoader.load([loadDataConfigWithFilter]);
        ok((loadDataResult[0] as ILoadDataResult).data.getCount() === 1);
        ok(!dataLoader.getSearchControllerSync('randomId'));
        ok(dataLoader.getSearchControllerSync());
    });

    it('load with default load timeout', async () => {
        const fakeTimer = useFakeTimers();
        const source = getSource();
        source.query = () => new Promise(() => {
            Promise.resolve().then(() => {
                fakeTimer.tick(40000);
            });
        });
        const loadDataConfig = {
            source,
            filter: {}
        };

        const dataLoader = getDataLoader();
        const loadDataResult = dataLoader.load([loadDataConfig]);
        return new Promise((resolve) => {
            loadDataResult.then((loadResult ) => {
                ok(loadResult[0].sourceController.getLoadError().status === HTTPStatus.GatewayTimeout);
                resolve();
            });
        });
    });

    it('load filter data with history ids in filter', async () => {
        const filterDescription = [{
            name: 'tasks',
            type: 'list',
            value: [],
            resetValue: [],
            textValue: '',
            editorOptions: {
                source: getSource(),
                historyId: 'history',
                filter: {
                    myTasks: true
                }
            }
        },
            {
                name: 'contacts',
                type: 'list',
                value: ['1'],
                resetValue: ['2'],
                textValue: '',
                editorOptions: {
                    source: getSource(),
                    historyId: 'history',
                    keyProperty: 'id',
                    filter: {
                        myContacts: true
                    }
                }
            }];
        const loadDataConfigWithFilter = {
            type: 'list',
            source: getSource(),
            filter: {},
            filterButtonSource: filterDescription
        } as ILoadDataConfig;
        const dataLoader = getDataLoader();
        await dataLoader.load<ILoadDataResult>([loadDataConfigWithFilter]);
        const filterController = dataLoader.getFilterController();
        const tasksFilter = filterController.getFilterButtonItems()[0].editorOptions.filter;
        const expectedTasksFilter = {
            myTasks: true,
            _historyIds: ['history']
        };
        const contactsFilter = filterController.getFilterButtonItems()[1].editorOptions.filter;
        const expectedContactsFilter = {
            myContacts: true,
            _historyIds: ['history'],
            id: ['1']
        };
        assert.deepStrictEqual(expectedTasksFilter, tasksFilter);
        assert.deepStrictEqual(expectedContactsFilter, contactsFilter);
    });

    it('load with timeout', async () => {
        const fakeTimer = useFakeTimers();
        const source = getSource();
        const loadTimeOut = 5000;
        const queryLoadTimeOut = 10000;
        source.query = () => new Promise(() => {
            Promise.resolve().then(() => {
                fakeTimer.tick(queryLoadTimeOut);
            });
        });
        const loadDataConfig = {
            source,
            filter: {}
        };

        const dataLoader = getDataLoader();
        const loadDataResult = dataLoader.loadEvery([loadDataConfig], loadTimeOut);
        return new Promise((resolve) => {
            Promise.all(loadDataResult).then((loadResult) => {
                ok(loadResult[0].sourceController.getLoadError().status === HTTPStatus.GatewayTimeout);
                resolve();
            });
        });
    });

    it('object config', () => {
        const config = {
            list: {
                type: 'list',
                source: getSource(),
                filter: {}
            },
            custom: {
                type: 'custom',
                loadDataMethod: () => {
                    return Promise.resolve('result');
                }
            }
        };
        const dataLoader = getDataLoader();
        return dataLoader.load(config).then((loadDataResult) => {
            assert.isTrue(loadDataResult.list instanceof Object);
            assert.equal(loadDataResult.custom, 'result');
        });
    });

    describe('dependencies', () => {
        it('multiple dependencies', () => {
            const config = {
                list: {
                    type: 'list',
                    source: getSource(),
                    filter: {}
                },
                custom: {
                    type: 'custom',
                    dependencies: ['list'],
                    loadDataMethod: (args, [listResult]) => {
                        return Promise.resolve({
                            list: listResult instanceof Object
                        });
                    }
                },
                custom1: {
                    type: 'custom',
                    dependencies: ['list', 'custom'],
                    loadDataMethod: (args, [listResult, customResult]) => {
                        return Promise.resolve({
                            list: listResult instanceof Object,
                            custom: customResult && customResult.list
                        });
                    }
                }
            };
            const dataLoader = getDataLoader();
            return dataLoader.load(config).then((loadDataResult) => {
                assert.isTrue(loadDataResult.custom.list);
                assert.isTrue(loadDataResult.custom1.list);
                assert.isTrue(loadDataResult.custom1.custom);
            });
        });
        it('circular dependencies', () => {
            // Мокаем логгер, т.к. при ошибке загрузки кидаем ошибку в логи, но при ошибках в консоль падают юниты
            const logError = Logger.error;
            Logger.error = () => void 0;
            const config = {
                custom1: {
                    type: 'custom',
                    dependencies: ['custom'],
                    loadDataMethod: (args, [customResult]) => {
                        return Promise.resolve({
                           custom: customResult && customResult.custom1
                        });
                    }
                },
                custom: {
                    type: 'custom',
                    dependencies: ['custom1'],
                    loadDataMethod: (args, [customResult]) => {
                        return Promise.resolve({
                            custom1: customResult && customResult.custom
                        });
                    }
                }
            };
            const dataLoader = getDataLoader();
            let finishedWithErrors = false;
            return dataLoader.load(config).catch(() => {
                finishedWithErrors = true;
            }).finally(() => {
                assert.isTrue(finishedWithErrors);
                Logger.error = logError;
            });
        });

        it('undefined dependencies', () => {
            // Мокаем логгер, т.к. при ошибке загрузки кидаем ошибку в логи, но при ошибках в консоль падают юниты
            const logError = Logger.error;
            Logger.error = () => void 0;
            const config = {
                custom: {
                    type: 'custom',
                    dependencies: ['custom1', 'custom2'],
                    loadDataMethod: (args, [customResult]) => {
                        return Promise.resolve({
                            custom1: customResult && customResult.custom
                        });
                    }
                }
            };
            const dataLoader = getDataLoader();
            let finishedWithErrors = false;
            return dataLoader.load(config).catch(() => {
                finishedWithErrors = true;
            }).finally(() => {
                assert.isTrue(finishedWithErrors);
                Logger.error = logError;
            });
        });

        it('self dependencies', () => {
            // Мокаем логгер, т.к. при ошибке загрузки кидаем ошибку в логи, но при ошибках в консоль падают юниты
            const logError = Logger.error;
            Logger.error = () => void 0;
            const config = {
                custom: {
                    type: 'custom',
                    dependencies: ['custom'],
                    loadDataMethod: (args, [customResult]) => {
                        return Promise.resolve({
                            custom1: customResult && customResult.custom
                        });
                    }
                }
            };
            const dataLoader = getDataLoader();
            let finishedWithErrors = false;
            return dataLoader.load(config).catch(() => {
                finishedWithErrors = true;
            }).finally(() => {
                assert.isTrue(finishedWithErrors);
                Logger.error = logError;
            });
        });
    });
});
