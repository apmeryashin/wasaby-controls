import {assert} from 'chai';
import {PrimaryAction} from 'Controls/form';
import {constants} from 'Env/Env';

describe('Controls/form:PrimaryAction', () => {
    it('trigger called', () => {
        const instance = new PrimaryAction({});
        const event = {
            nativeEvent: {
                keyCode: constants.key.enter,
                altKey: false,
                ctrlKey: true
            },
            stopPropagation: sinon.fake()
        };
        const sandbox = sinon.createSandbox();
        sandbox.stub(instance, '_notify');
        instance.keyDownHandler(event);
        sinon.assert.calledWith(instance._notify, 'triggered');
        instance.destroy();
    });

    it('trigger not called', () => {
        const instance = new PrimaryAction({});
        const event = {
            nativeEvent: {
                keyCode: constants.key.enter,
                altKey: true,
                ctrlKey: true
            }
        };
        const sandbox = sinon.createSandbox();
        sandbox.stub(instance, '_notify');

        instance.keyDownHandler(event);
        sinon.assert.notCalled(instance._notify);

        event.nativeEvent.altKey = false;
        event.nativeEvent.keyCode = 0;

        instance.keyDownHandler(event);
        sinon.assert.notCalled(instance._notify);

        instance.destroy();
    });
});
