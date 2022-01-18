import {Chips} from 'Controls/toggle';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {assert} from 'chai';

describe('Controls/toggle:Chips', () => {
    it('Chips _onItemClick', () => {
        const control = new Chips({});
        const item1 = new Model({rawData: {id: '1', caption: 'Название 1'}, keyProperty: 'id'});
        const item2 = new Model({rawData: {id: '2', caption: 'Название 2'}, keyProperty: 'id'});
        const item3 = new Model({rawData: {id: '3', caption: 'Название 3'}, keyProperty: 'id'});
        control.saveOptions({
            keyProperty: 'id',
            selectedKeys: ['2'],
            items: new RecordSet({
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
            })
        });
        let step: number = 1;
        const sandbox = sinon.createSandbox();
        sandbox.replace(control, '_notify', ((text, args: string[]) => {
            switch (step) {
                case 1:
                    assert.equal(args[1][0], '1');
                    break;
                case 2:
                    assert.equal(args[1][0], '3');
                    break;
                case 3:
                    assert.equal(args[2][0], '3');
                    break;
                case 4:
                    assert.equal(args[2][0], '2');
                    break;
            }
            return text.length;
        }));
        control._onItemClick({}, item1);
        step++;
        control._onItemClick({}, item3);
        step++;
        control._onItemClick({}, item3);
        step++;
        control._onItemClick({}, item2);
        sandbox.restore();
    });
});
