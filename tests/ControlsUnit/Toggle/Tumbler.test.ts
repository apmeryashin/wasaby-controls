import {Tumbler} from 'Controls/toggle';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {assert} from 'chai';

describe('Controls/toggle:Tumbler', () => {
    it('Tumbler _beforeUpdate', () => {
        const control = new Tumbler({});
        control._backgroundPosition = {isEmpty: false};
        control._beforeUpdate({});
        assert.deepEqual(control._backgroundPosition, {isEmpty: false});

        control._beforeUpdate({items: []});
        assert.deepEqual(control._backgroundPosition, {isEmpty: true});
        control.destroy();
    });

    it('Tumbler _onItemClick', () => {
        const control = new Tumbler({});
        const item1 = new Model({rawData: {id: '-1', caption: 'Название 1'}, keyProperty: 'id'});
        const item2 = new Model({rawData: {id: '2', caption: 'Название 2'}, keyProperty: 'id'});
        control.saveOptions({
            keyProperty: 'id',
            selectedKey: '2',
            items: new RecordSet({
                rawData: [
                    {
                        id: '-1',
                        caption: 'Название 1'
                    },
                    {
                        id: '2',
                        caption: 'Название 2'
                    }
                ],
                keyProperty: 'id'
            })
        });
        const sandbox = sinon.createSandbox();
        const notifySpy = sandbox.spy(control, '_notify');
        control._onItemClick({}, item1);
        control._onItemClick({}, item2);
        assert.isTrue(notifySpy.calledOnce);
        sandbox.restore();
    });

    it('Tumbler _mouseEnterHandler', () => {
        const control = new Tumbler({});
        control.saveOptions({
            keyProperty: 'id',
            items: new RecordSet({
                rawData: [
                    {
                        id: '-1',
                        caption: 'Название 1'
                    },
                    {
                        id: '2',
                        caption: 'Название 2'
                    }
                ],
                keyProperty: 'id'
            })
        });
        control._children = {
            'TumblerButton0': {
                getBoundingClientRect: () => {
                    return {
                        width: 10,
                        height: 10,
                        left: 20,
                        top: 2
                    };
                }
            },
            'TumblerButton1': {
                getBoundingClientRect: () => {
                    return {
                        width: 30,
                        height: 30,
                        left: 40,
                        top: 2
                    };
                }
            }
        };
        control._container = {
            getBoundingClientRect: () => {
                return {
                    left: 0,
                    top: 0
                };
            }
        };
        const result = {
            isEmpty: false,
            '-1': {
                width: 10,
                height: 10,
                left: 20,
                top: 2
            },
            2: {
                width: 30,
                height: 30,
                left: 40,
                top: 2
            }
        };

        control._mouseEnterHandler();
        assert.deepEqual(control._backgroundPosition, result);
        control.destroy();
    });
});
