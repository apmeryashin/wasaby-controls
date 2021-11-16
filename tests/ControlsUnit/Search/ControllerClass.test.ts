import {ControllerClass} from 'Controls/search';
import {assert} from 'chai';
import {NewSourceController, NewSourceController as SourceController} from 'Controls/dataSource';
import {Memory, QueryWhereExpression} from 'Types/source';
import {createSandbox, SinonSpy} from 'sinon';
import {IControllerOptions} from 'Controls/_dataSource/Controller';
import {RecordSet} from 'Types/collection';
import {ISearchControllerOptions} from 'Controls/_search/ControllerClass';

const getMemorySource = (): Memory => {
   return new Memory({
      data: [
         {
            id: 0,
            title: 'test'
         },
         {
            id: 1,
            title: 'test1'
         },
         {
            id: 2,
            title: 'test'
         },
         {
            id: 3,
            title: 'test2'
         }
      ]
   });
};

const getSourceController = (options?: Partial<IControllerOptions>) => {
   return new SourceController({
      dataLoadErrback: () => null,
      parentProperty: null,
      root: null,
      sorting: [],
      filter: {
         payload: 'something'
      },
      keyProperty: 'id',
      source: getMemorySource(),
      navigation: {
         source: 'page',
         sourceConfig: {
            pageSize: 2,
            page: 0,
            hasMore: false
         }
      },
      ...options
   });
};

const  getSearchControllerClassOptions = (options = {}) => {
   const defaultOptions = {
      minSearchLength: 3,
      searchDelay: 50,
      searchParam: 'testParam',
      searchValue: '',
      searchValueTrim: false,
      sourceController: getSourceController(options)
   };
   return {
      ...defaultOptions,
      ...options
   };
};

const getSearchController = (options?) => {
   return new ControllerClass(getSearchControllerClassOptions(options));
};

describe('Controls/search:ControllerClass', () => {
   const sandbox = createSandbox();

   let sourceController: SourceController;
   let controllerClass: ControllerClass;
   let loadSpy: SinonSpy;

   beforeEach(() => {
      sourceController = getSourceController({});
      controllerClass = getSearchController({
         sourceController
      });
      loadSpy = sandbox.spy(sourceController, 'load');
   });

   afterEach(() => {
      sandbox.reset();
   });

   after(() => sandbox.restore());

   it('searchValue in constructor', () => {
      let options;
      let searchControllerClass;

      options = {
         searchValue: 'testSearchValue'
      };
      searchControllerClass = new ControllerClass(options);
      assert.ok(searchControllerClass.getSearchValue() === 'testSearchValue');

      options = {};
      searchControllerClass = new ControllerClass(options);
      assert.ok(searchControllerClass.getSearchValue() === '');
   });

   it('search method', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue',
         payload: 'something'
      };
      controllerClass.search('testValue');

      assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);
   });

   it('load canceled while searching', () => {
      const filter = sourceController.getFilter();
      controllerClass.search('testValue');
      sourceController.cancelLoading();

      assert.deepStrictEqual(filter, sourceController.getFilter());
   });

   it('getFilter', () => {
      const resultFilter = {
         testParam: 'testSearchValue',
         payload: 'something'
      };
      controllerClass._searchValue = 'testSearchValue';
      assert.deepEqual(controllerClass.getFilter(), resultFilter);
   });

   it('needChangeSearchValueToSwitchedString', () => {
      const rs = new RecordSet();
      rs.setMetaData({
         returnSwitched: true
      });
      assert.ok(controllerClass.needChangeSearchValueToSwitchedString(rs));
   });

   it('search with searchStartCallback', async () => {
      sourceController = getSourceController({
         source: new Memory()
      });
      let searchStarted = false;
      const searchController = getSearchController({
         sourceController,
         searchStartCallback: () => {
            searchStarted = true;
         }
      });
      await searchController.search('testSearchValue');
      assert.ok(searchStarted);
   });

   describe('with hierarchy', () => {
      it('default search case and reset', () => {
         const filter: QueryWhereExpression<unknown> = {
            testParam: 'testValue',
            testParent: 'testRoot',
            payload: 'something',
            Разворот: 'С разворотом',
            usePages: 'full'
         };
         controllerClass._options.parentProperty = 'testParent';
         controllerClass._root = 'testRoot';
         controllerClass._options.startingWith = 'current';

         controllerClass.search('testValue');

         assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);
         loadSpy.resetHistory();

         controllerClass.reset();
         assert.isTrue(loadSpy.withArgs(undefined, undefined, {
            payload: 'something'
         }).called);
      });

      it('filter with "Разворот"', async () => {
         sourceController = getSourceController();
         const searchController = getSearchController({
            parentProperty: 'Раздел',
            sourceController
         });

         sourceController.setFilter({
            Разворот: 'С разворотом'
         });

         await searchController.search('testSearchValue');
         assert.ok(searchController.getFilter().Разворот);

         const filter = searchController.reset(true);
         assert.ok(filter.Разворот);
         assert.ok(filter.usePages);

         sourceController.setFilter({
            Разворот: 'Без разворота'
         });

         await searchController.search('testSearchValue');
         const filter = searchController.reset(true);
         assert.ok(!filter.usePages);
      });

      describe('startingWith: root', () => {
         function getHierarchyOptions(): Partial<ISearchControllerOptions> {
            return {
               parentProperty: 'parentProperty',
               root: 'testRoot',
               startingWith: 'root'
            };
         }

         function getPath(): RecordSet {
            return new RecordSet({
               rawData: [
                  {
                     id: 0,
                     parentProperty: null
                  },
                  {
                     id: 1,
                     parentProperty: 0
                  }
               ]
            });
         }

         it('root before search should saved after reset search', async () => {
            sourceController = getSourceController(getHierarchyOptions());
            const searchControllerOptions = {
               sourceController,
               ...getHierarchyOptions()
            };
            const searchController = getSearchController(searchControllerOptions);
            searchController.setPath(getPath());
            await searchController.search('testSearchValue');
            assert.ok(sourceController.getRoot() === null);
            assert.ok(searchController.getRoot() === null);
            assert.ok(sourceController.getFilter().parentProperty === null);

            searchController.reset(true);
            assert.ok(searchController.getRoot() === 'testRoot');
         });

         it('update root while searching', async () => {
            sourceController = getSourceController(getHierarchyOptions());
            let searchControllerOptions = {
               sourceController,
               ...getHierarchyOptions()
            };
            const searchController = getSearchController(searchControllerOptions);
            searchController.setPath(getPath());
            await searchController.search('testSearchValue');
            searchControllerOptions = {...searchControllerOptions};
            searchControllerOptions.root = 'myRoot';
            searchController.update(searchControllerOptions);
            searchController.reset(true);
            assert.ok(searchController.getRoot() === 'myRoot');
         });

         it('update with same root while searching', async () => {
            sourceController = getSourceController(getHierarchyOptions());
            let searchControllerOptions = {
               sourceController,
               ...getHierarchyOptions()
            };
            const searchController = getSearchController(searchControllerOptions);
            searchController.setPath(getPath());
            await searchController.search('testSearchValue');
            searchControllerOptions = {...searchControllerOptions};
            searchControllerOptions.root = null;
            searchController.update(searchControllerOptions);
            searchController.reset(true);
            assert.ok(searchController.getRoot() === 'testRoot');
         });

      });

      it('without parent property', () => {
         const filter: QueryWhereExpression<unknown> = {
            testParam: 'testValue',
            payload: 'something'
         };
         controllerClass._root = 'testRoot';
         controllerClass._options.startingWith = 'current';

         controllerClass.search('testValue');

         assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);
         loadSpy.resetHistory();

         controllerClass.reset();
         assert.isTrue(loadSpy.withArgs(undefined, undefined, {
            payload: 'something'
         }).called);
      });

      it('getFilter', () => {
         const resultFilter = {
            testParam: 'testSearchValue',
            Разворот: 'С разворотом',
            usePages: 'full',
            payload: 'something',
            testParentProeprty: 'testRoot'
         };
         controllerClass._root = 'testRoot';
         controllerClass._searchValue = 'testSearchValue';
         controllerClass._options.parentProperty = 'testParentProeprty';
         assert.deepEqual(controllerClass.getFilter(), resultFilter);
      });
   });

   it('search and reset', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue',
         payload: 'something'
      };
      controllerClass.search('testValue');

      assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);

      controllerClass.reset();

      assert.isTrue(loadSpy.withArgs(undefined, undefined, {
         payload: 'something'
      }).called);
   });

   it('search and update', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue',
         payload: 'something'
      };
      const updatedFilter: QueryWhereExpression<unknown> = {
         testParam: 'updatedValue',
         payload: 'something'
      };
      controllerClass.search('testValue');

      assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);

      controllerClass.update({
         searchValue: 'updatedValue',
         root: 'newRoot'
      });

      assert.equal(controllerClass._root, 'newRoot');
   });

   it('double search call', () => {
      const searchPromise = controllerClass.search('testValue');
      assert.ok(searchPromise === controllerClass.search('testValue'));
   });

   describe('update', () => {
      it('shouldn\'t call when searchValue is null', () => {
         const searchStub = sandbox.stub(controllerClass, 'search');
         const resetStub = sandbox.stub(controllerClass, 'reset');

         controllerClass._options.searchValue = null;
         controllerClass._searchValue = null;

         controllerClass.update({
            searchValue: null
         });

         assert.isFalse(searchStub.called);
         assert.isFalse(resetStub.called);
      });

      it('shouldn\'t call when searchValue is not in options object', () => {
         const searchStub = sandbox.stub(controllerClass, 'search');
         const resetStub = sandbox.stub(controllerClass, 'reset');

         controllerClass._options.searchValue = null;

         controllerClass.update({});

         assert.isFalse(searchStub.called);
         assert.isFalse(resetStub.called);
      });

      it('should call reset when new sourceController in options', async () => {
         let searchControllerOptions = getSearchControllerClassOptions();
         const searchController = getSearchController(searchControllerOptions);

         searchControllerOptions = {...searchControllerOptions};
         searchControllerOptions.searchValue = 'test';
         assert.isTrue(searchController.update(searchControllerOptions));
         await searchController.search('test');

         searchControllerOptions = {...searchControllerOptions};
         searchControllerOptions.sourceController = getSourceController({source: new Memory()});
         assert.isTrue(searchController.update(searchControllerOptions));

         searchControllerOptions = {...searchControllerOptions};
         searchControllerOptions.searchValue = '';
         assert.isTrue(searchController.update(searchControllerOptions));
      });

      it('should call when searchValue not equal options.searchValue', () => {
         controllerClass._options.searchValue = '';
         controllerClass._searchValue = 'searchValue';

         assert.isTrue(controllerClass.update({
            searchValue: ''
         }));
      });

      it('update with same value after search', async () => {
         await controllerClass.search('testSearchValue');

         const updateResult = controllerClass.update({
            searchValue: 'testSearchValue'
         });

         assert.ok(!(updateResult instanceof Promise));
      });
   });

   it('search with filterOnSearchCallback option', async () => {
      const filter = {};
      const source = getMemorySource();
      const navigation = {
         source: 'page',
         sourceConfig: {
            pageSize: 2,
            page: 0,
            hasMore: false
         }
      };
      const sourceController = new NewSourceController({
         source,
         navigation
      });
      let filterOnItemsChanged;
      await sourceController.reload();
      sourceController.getItems().subscribe('onCollectionChange', () => {
         filterOnItemsChanged = sourceController.getFilter();
      });
      const searchControllerOptions = {
         filterOnSearchCallback: (searchValue, item) => {
            return item.get('title') === 'test';
         },
         filter,
         sourceController,
         source,
         navigation,
         searchParam: 'title'
      };
      const searchController = getSearchController(searchControllerOptions);
      const searchPromise = searchController.search('test');

      assert.ok(filterOnItemsChanged.title);
      assert.ok(sourceController.getItems().getCount() === 1);
      assert.ok(sourceController.getItems().at(0).get('title') === 'test');

      await searchPromise;
      assert.ok(sourceController.getItems().getCount() === 2);
   });

   describe('search', () => {
      it('search returns error', async () => {
         const source = new Memory();
         source.query = () => {
            return Promise.reject();
         };
         sourceController = getSourceController({
            source
         });
         const searchController = getSearchController({sourceController});
         await searchController.search('testSearchValue').catch(() => {/* FIXME: sinon mock */});
         assert.deepStrictEqual(
             sourceController.getFilter(),
             {
                payload: 'something',
                testParam: 'testSearchValue'
             }
         );
      });

      it('search without root', async () => {
         const sourceController = getSourceController({
            source: new Memory()
         });
         const searchController = getSearchController({sourceController});
         await searchController.search('testSearchValue');
         assert.ok(sourceController.getRoot() === null);
      });

      it('search with root and startingWith: "root"', async () => {
         const hierarchyOptions = {
            parentProperty: 'parentProperty',
            root: 'testRoot',
            startingWith: 'root'
         };
         sourceController = getSourceController({
            source: new Memory(),
            ...hierarchyOptions
         });
         const searchController = getSearchController({
            sourceController,
            ...hierarchyOptions
         });
         searchController.setPath(new RecordSet({
            rawData: [
               {
                  id: 'testId',
                  parentProperty: 'testParent'
               }
            ]
         }));
         await searchController.search('testSearchValue');
         assert.ok(sourceController.getFilter().searchStartedFromRoot === 'testRoot');
      });

      it('search with expandedItems', async () => {
         sourceController = getSourceController({
            source: new Memory(),
            expandedItems: ['test']
         });
         let searchController = getSearchController({sourceController});
         await searchController.search('testSearchValue');
         assert.deepStrictEqual(sourceController.getExpandedItems(), []);

         sourceController = getSourceController({
            source: new Memory(),
            expandedItems: [null]
         });
         searchController = getSearchController({sourceController});
         await searchController.search('testSearchValue');
         assert.deepStrictEqual(sourceController.getExpandedItems(), [null]);
      });

      it('inputSearchValue changed while search is in process', async () => {
         sourceController = getSourceController();
         const searchController = getSearchController({sourceController});
         const searchPromise = searchController.search('testSearchValue');
         searchController.setInputSearchValue('newInputSearchValue');

         return searchPromise.catch((error) => {
            assert.ok(error.isCanceled);
         });
      });

      it('search with searchValueTrim option', async () => {
         const searchController = getSearchController({
            sourceController: getSourceController({filter: {}}),
            searchValueTrim: true,
            searchParam: 'title'
         });

         let searchResult = await searchController.search('   test    ');
         assert.ok((searchResult as RecordSet).getCount() === 2);

         await searchController.reset();
         searchResult = await searchController.search('     ');
         assert.ok(searchResult === null);
      });

      it('search with new sourceController', async () => {
         let sourceController = getSourceController({filter: {}});
         let searchControllerOptions = getSearchControllerClassOptions({
            sourceController,
            searchValueTrim: true,
            searchParam: 'title'
         });
         const searchController = getSearchController(searchControllerOptions);

         await searchController.search('test');
         assert.ok(sourceController.getFilter().title === 'test');

         searchControllerOptions = {...searchControllerOptions};
         sourceController = getSourceController({filter: {}});
         searchControllerOptions.sourceController = sourceController;
         searchController.update(searchControllerOptions);
         await searchController.search('test2');
         assert.ok(sourceController.getFilter().title === 'test2');
      });
   });
});
