import {default as Loader} from 'Controls/_dataSource/DataLoader/PropertyGridProvider';
import {assert} from 'chai';
import {Memory} from 'Types/source';
import {object} from 'Types/util';

const typeDescription = [{
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
    }];

describe('Controls/_dataSource/DataLoader/PropertyGridProvider', () => {
    it('load and create sourceController in editorOptions', async () => {
        const config = await new Loader().load({
            typeDescription: object.clone(typeDescription),
            type: 'propertyGrid'
        });
        assert.isTrue(config[0].editorOptions.hasOwnProperty('sourceController'));
        assert.isTrue(config[1].editorOptions.hasOwnProperty('sourceController'));
        assert.equal(config[0].editorOptions.sourceController.getItems().getCount(), 1);
        assert.equal(config[1].editorOptions.sourceController.getItems().getCount(), 1);
    });

    it('load and create sourceController with propertyGridEditor', async () => {
        const config = object.clone(typeDescription);
        config.push({
            name: 'pg',
            type: 'propertyGrid',
            editorOptions: {
                typeDescription
            }
        });
        const resultLoad = await new Loader().load({
            typeDescription: config,
            type: 'propertyGrid'
        });
        const pgDescription = resultLoad[2].editorOptions.typeDescription;
        assert.isTrue(pgDescription[0].editorOptions.hasOwnProperty('sourceController'));
        assert.isTrue(pgDescription[1].editorOptions.hasOwnProperty('sourceController'));
        assert.equal(pgDescription[0].editorOptions.sourceController.getItems().getCount(), 1);
        assert.equal(pgDescription[1].editorOptions.sourceController.getItems().getCount(), 1);
    });
});
