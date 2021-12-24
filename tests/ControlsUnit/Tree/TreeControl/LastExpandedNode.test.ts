import {HierarchicalMemory, Query} from 'Types/source';
import {ITreeControlOptions, TreeControl} from 'Controls/tree';
import { RecordSet } from 'Types/collection';
import { TreeGridCollection } from 'Controls/treeGrid';
import { register } from 'Types/di';
import { assert } from 'chai';
import { createSandbox, spy, assert as sinonAssert } from 'sinon';
import { NewSourceController } from 'Controls/dataSource';
import {SearchGridCollection} from 'Controls/searchBreadcrumbsGrid';

register('Controls/treeGrid:TreeGridCollection', TreeGridCollection, {instantiate: false});
register('Controls/searchBreadcrumbsGrid:SearchGridCollection', SearchGridCollection, {instantiate: false});

const initialData = [
    {
        id: '1',
        parent: null,
        type: true
    },
    {
        id: '11',
        parent: 1,
        type: null
    },
    {
        id: '2',
        parent: null,
        type: true
    },
    {
        id: '21',
        parent: '2',
        type: null
    },
    {
        id: '22',
        parent: '2',
        type: null
    }
];

describe('Controls/Tree/TreeControl/LastExpandedNode', () => {
    let source: HierarchicalMemory;

    let sandbox: any;
    let hasLoaded: boolean;
    let hasMoreData: boolean;
    let data: object[];

    function initSourceController(source: HierarchicalMemory): NewSourceController {
        const sourceController = new NewSourceController({
            nodeProperty: 'type',
            parentProperty: 'parent',
            source
        });
        sandbox.stub(sourceController, 'getItems')
            .callsFake(() => new RecordSet({
                keyProperty: 'id',
                rawData: data
            }));
        sandbox.stub(sourceController, 'load')
            .callsFake((direction: string, root: string) => {
                const query = new Query().where({root});
                return source.query(query);
            });
        sandbox.stub(sourceController, 'hasLoaded')
            .callsFake(() => hasLoaded);
        sandbox.stub(sourceController, 'hasMoreData')
            .callsFake(function(direction: string, root?: string): boolean {
                if (!root) {
                    root = this._root;
                }
                return root !== null ? hasMoreData : false;
            });
        return sourceController;
    }

    function initTreeControl(cfg: Partial<ITreeControlOptions> = {}): TreeControl {
        const sourceController = initSourceController(source);
        const config: ITreeControlOptions = {
            viewName: 'Controls/List/TreeGridView',
            root: null,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'type',
            source,
            viewModelConstructor: 'Controls/treeGrid:TreeGridCollection',
            sourceController,
            virtualScrollConfig: {
                pageSize: 1
            },
            navigation: {
                view: 'infinity'
            },
            ...cfg
        };
        const treeControl = new TreeControl(config);
        treeControl.saveOptions(config);
        treeControl._beforeMount(config);
        return treeControl;
    }

    beforeEach(() => {
        data = [...initialData];
        hasLoaded = false;
        hasMoreData = true;
        sandbox = createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it ('should load from root when items are collapsed', async () => {
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });
        const spyQuery = sandbox.spy(source, 'query');
        const treeControl = initTreeControl();

        await treeControl.handleTriggerVisible('down');
        sinonAssert.notCalled(spyQuery);
    });

    it ('should load from root when expanded item is not last', async () => {
        data = [
            ...data,
            {
                id: '3',
                parent: null,
                type: true
            }
        ];
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });

        const spyQuery = sandbox.spy(source, 'query');
        const treeControl = initTreeControl();
        await treeControl.toggleExpanded('2');

        await treeControl.handleTriggerVisible('down');
        sinonAssert.calledOnce(spyQuery);
    });

    it ('should load from root when expanded item is empty', async () => {
        data = [
            ...data,
            {
                id: '3',
                parent: null,
                type: true
            }
        ];
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });

        const spyQuery = sandbox.spy(source, 'query');
        const treeControl = initTreeControl();
        await treeControl.toggleExpanded('3');
        sinonAssert.calledOnce(spyQuery);

        hasMoreData = false;
        await treeControl.handleTriggerVisible('down');
        sinonAssert.calledOnce(spyQuery);
    });

    it ('should load from last expanded node', async () => {
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });
        const stubQuery = sandbox.stub(source, 'query').callsFake((query: Query) => {
            assert.equal(query.getWhere().root, 2);
            return Promise.resolve();
        });
        const treeControl = initTreeControl();
        await treeControl.toggleExpanded('2');
        sinonAssert.calledOnce(stubQuery);

        await treeControl.handleTriggerVisible('down');

        sinonAssert.calledTwice(stubQuery);
    });

    it ('should not load from last expanded node when nodeFooterTemplate is set', async () => {
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });

        const spyQuery = sandbox.spy(source, 'query');
        const treeControl = initTreeControl({
            nodeFooterTemplate: () => ''
        });
        await treeControl.toggleExpanded('1');

        await treeControl.handleTriggerVisible('down');
        sinonAssert.calledOnce(spyQuery);
    });

    it ('should load from last expanded node when nodeFooterTemplate overrided by moreTemplate', async () => {
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });

        const spyQuery = sandbox.spy(source, 'query');
        const treeControl = initTreeControl({
            nodeFooterTemplate: () => ''
        });
        await treeControl.toggleExpanded('2');

        await treeControl.handleTriggerVisible('down');
        sinonAssert.calledTwice(spyQuery);
    });

    it ('should not try loading for BreadcrumbsItem', async () => {
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });

        const spyQuery = sandbox.spy(source, 'query');
        // Инициализируем TreeControl с поисковой моделью (чтобы получть Breadcrumbs)
        const treeControl = initTreeControl({
            viewModelConstructor: 'Controls/searchBreadcrumbsGrid:SearchGridCollection'
        });

        await treeControl.handleTriggerVisible('down');
        sinonAssert.notCalled(spyQuery);
    });
});
