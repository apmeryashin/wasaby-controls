import {default as Loader} from 'Controls/_dataSource/DataLoader/PropertyGridProvider';
import {assert} from 'chai';
import {Memory, HierarchicalMemory} from 'Types/source';
import {IProperty} from 'Controls/propertyGrid';

function getTypeDescription(): IProperty[] {
    return [
        {
            name: 'tasks',
            type: 'list',
            value: [],
            resetValue: [],
            textValue: '',
            editorOptions: {
                historyId: 'history',
                source: new Memory({
                    keyProperty: 'id',
                    data: [{
                        id: 1,
                        title: 'vasya'
                    }]
                })
            }
        },
        {
            name: 'contacts',
            type: 'list',
            value: ['1'],
            resetValue: ['2'],
            textValue: '',
            editorOptions: {
                historyId: 'history',
                source: new Memory({
                    keyProperty: 'id',
                    data: [{
                        id: 1,
                        title: 'vasya'
                    }]
                }),
                keyProperty: 'id'
            }
        },
        {
            name: 'customers',
            type: 'list',
            value: [],
            resetValue: [],
            textValue: '',
            editorOptions: {
                source: new HierarchicalMemory({
                    keyProperty: 'id',
                    data: [
                        {
                            id: 1,
                            title: 'Tensor',
                            parent: null
                        },
                        {
                            id: 2,
                            title: 'Saby',
                            parent: 1
                        }
                    ]
                }),
                keyProperty: 'id',
                parentProperty: 'parent',
                expandedItems: [1]
            }
        }
    ];
}

describe('Controls/_dataSource/DataLoader/PropertyGridProvider', () => {
    it('load and set items in editorOptions', async () => {
        const config = await new Loader().load({
            typeDescription: getTypeDescription(),
            type: 'propertyGrid'
        });
        assert.isTrue(config[0].editorOptions.hasOwnProperty('items'));
        assert.isTrue(config[1].editorOptions.hasOwnProperty('items'));
        assert.equal(config[0].editorOptions.items.getCount(), 1);
        assert.equal(config[1].editorOptions.items.getCount(), 1);
        assert.equal(config[2].editorOptions.items.getCount(), 2);
    });

    it('load and set items with propertyGridEditor', async () => {
        const config = getTypeDescription();
        config.push({
            name: 'pg',
            type: 'propertyGrid',
            editorOptions: {
                typeDescription: getTypeDescription()
            }
        });
        const resultLoad = await new Loader().load({
            typeDescription: config,
            type: 'propertyGrid'
        });
        const pgDescription = resultLoad[3].editorOptions.typeDescription;
        assert.isTrue(pgDescription[0].editorOptions.hasOwnProperty('items'));
        assert.isTrue(pgDescription[1].editorOptions.hasOwnProperty('items'));
        assert.equal(pgDescription[0].editorOptions.items.getCount(), 1);
        assert.equal(pgDescription[1].editorOptions.items.getCount(), 1);
    });
});
