import {default as ConfigGetter} from 'Controls/_filterPanel/LoadConfigGetter';
import {assert} from 'chai';

describe('Controls/_filterPanel/LoadConfigGetter', () => {
    it('prepare filter with history in editorOptions', () => {
        const typeDescription = [{
            name: 'tasks',
            type: 'list',
            value: [],
            resetValue: [],
            textValue: '',
            editorOptions: {
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
                historyId: 'history',
                keyProperty: 'id',
                filter: {
                    myContacts: true
                }
            }
        }];
        const config = ConfigGetter('filter', typeDescription);
        const tasksFilter = config.typeDescription[0].editorOptions.filter;
        const expectedTasksFilter = {
            myTasks: true,
            historyIds: ['history']
        };
        const contactsFilter = config.typeDescription[1].editorOptions.filter;
        const expectedContactsFilter = {
            myContacts: true,
            historyIds: ['history'],
            id: ['1']
        };
        assert.deepStrictEqual(expectedTasksFilter, tasksFilter);
        assert.deepStrictEqual(expectedContactsFilter, contactsFilter);
    });
});
