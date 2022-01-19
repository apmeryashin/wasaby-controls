import jsdom = require('jsdom');
import { assert } from 'chai';
import { spy } from 'sinon';
import {
    IObserversControllerOptions as ControllerOptions, ObserversController
} from 'Controls/_baseList/Controllers/ScrollController/ObserverController/ObserversController';
import {
    getCollection,
    getListContainer,
    getListContainerWithNestedList,
    TriggerClass
} from 'ControlsUnit/list_clean/scroll/initUtils';

function getDefaultControllerOptions(): ControllerOptions {
    return {
        listContainer: null,
        listControl: null,
        triggersQuerySelector: `.${TriggerClass}`,
        triggersPositions: {backward: 'offset', forward: 'offset'},
        triggersVisibility: {backward: true, forward: true},
        triggersOffsetCoefficients: {backward: 0, forward: 0},
        additionalTriggersOffsets: {backward: 0, forward: 0},
        observersCallback: () => null,
        viewportSize: null
    };
}

function getController(options: Partial<ControllerOptions>): ObserversController {
    return new ObserversController({
        ...getDefaultControllerOptions(),
        ...options
    });
}

describe('Controls/_baseList/Controllers/AbstractObserversController', () => {
    before(() => {
        window = new jsdom.JSDOM('').window;
    });

    after(() => {
        window = {};
    });

    describe('getTriggers', () => {
        it('default', () => {
            const collection = getCollection([{key: 1}]);
            const listContainer = getListContainer(collection);
            const observersCallback = spy(() => null);
            const controller = getController({observersCallback});
            controller.setListContainer(listContainer);
            assert.isTrue(observersCallback.calledTwice);
        });

        it('with nested lists', () => {
            const collection = getCollection([{key: 1}]);
            const nestedCollection = getCollection([{key: 11}]);
            const listContainer = getListContainerWithNestedList(collection, nestedCollection);
            const observersCallback = spy(() => null);
            const controller = getController({observersCallback});
            controller.setListContainer(listContainer);
            assert.isTrue(observersCallback.calledTwice);
        });
    });
});
