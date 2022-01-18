import {Chips} from 'Controls/toggle';
import {RecordSet} from 'Types/collection';
import {assert} from 'chai';

describe('Controls/toggle:Chips', () => {
    it('Chips _onItemClick', () => {
        const control = new Chips({});
        const recordSet = new RecordSet({
            rawData: [
                {
                    id: '1',
                    caption: 'Название 1'
                },
                {
                    id: '2',
                    caption: 'Название 2'
                },
                {
                    id: '3',
                    caption: 'Название 3'
                }
            ],
            keyProperty: 'id'
        });
        control.saveOptions({
            keyProperty: 'id',
            selectedKeys: ['2'],
            items: recordSet
        });
        const sandbox = sinon.createSandbox();
        const notifySpy = sandbox.spy(control, '_notify');
        control._onItemClick({}, recordSet.at(0));
        assert.equal(notifySpy.args[0][1][1][0], '1');
        control.saveOptions({
            keyProperty: 'id',
            selectedKeys: notifySpy.args[0][1][0],
            items: recordSet
        });
        control._onItemClick({}, recordSet.at(2));
        assert.equal(notifySpy.args[1][1][1][0], '3');
        control.saveOptions({
            keyProperty: 'id',
            selectedKeys: notifySpy.args[1][1][0],
            items: recordSet
        });
        control._onItemClick({}, recordSet.at(2));
        assert.equal(notifySpy.args[2][1][2][0], '3');
        control.saveOptions({
            keyProperty: 'id',
            selectedKeys: notifySpy.args[2][1][0],
            items: recordSet
        });
        control._onItemClick({}, recordSet.at(1));
        assert.equal(notifySpy.args[3][1][2][0], '2');
        sandbox.restore();
    });
});
