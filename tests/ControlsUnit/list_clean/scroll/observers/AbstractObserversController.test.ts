import jsdom = require('jsdom');
import { assert } from 'chai';
import { SinonSpy, spy, createSandbox } from 'sinon';
import {
    IObserversControllerOptions as ControllerOptions, ObserversController
} from 'Controls/_baseList/Controllers/ScrollController/ObserverController/ObserversController';
import {
    getCollection,
    getListContainer,
    getListContainerWithNestedList,
    getListControl, getScrollContainerWithList, ListContainerUniqueClass,
    TriggerClass
} from 'ControlsUnit/list_clean/scroll/initUtils';
import {Logger} from 'UI/Utils';

const DEFAULT_TRIGGERS_OFFSET_COEFF = 1 / 3;

function getDefaultControllerOptions(): ControllerOptions {
    return {
        listContainer: null,
        listControl: getListControl(),
        triggersQuerySelector: `.${TriggerClass}`,
        triggersPositions: {backward: 'offset', forward: 'offset'},
        triggersVisibility: {backward: true, forward: true},
        triggersOffsetCoefficients: {backward: DEFAULT_TRIGGERS_OFFSET_COEFF, forward: DEFAULT_TRIGGERS_OFFSET_COEFF},
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
    let controller: ObserversController;
    let observersCallback: SinonSpy;
    let listContainer: HTMLElement;
    let triggers: HTMLElement[];

    let sandbox;
    let stubLoggerError;

    before(() => {
        window = new jsdom.JSDOM('').window;
        Object.defineProperty(window.HTMLElement.prototype, 'offsetParent', {
            get() { return this.parentNode; },
            set() { /* NEED */}
        });

        sandbox = createSandbox();
    });

    after(() => {
        window = {};
    });

    beforeEach(() => {
        const collection = getCollection([{key: 1}]);
        const scrollContainer = getScrollContainerWithList(collection);
        listContainer = scrollContainer.querySelector(`.${ListContainerUniqueClass}`) as HTMLElement;
        listContainer.offsetParent = scrollContainer;
        observersCallback = spy((direction) => null);
        controller = getController({
            observersCallback,
            listContainer,
            viewportSize: 300
        });
        triggers = Array.from(listContainer.querySelectorAll(`.${TriggerClass}`)) as HTMLElement[];

        stubLoggerError = sandbox.stub(Logger, 'error').callsFake((message, errorPoint, errorInfo) => ({/* CALLED */}));
    });

    afterEach(() => {
        listContainer = null;
        controller = null;
        triggers = null;
        observersCallback = null;
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should set to triggers style', () => {
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '100px');
            assert.equal(triggers[1].style.bottom, '100px');
        });
    });

    describe('setListContainer', () => {
        it('new list container, should set style to triggers', () => {
            const collection = getCollection([{key: 1}]);
            const listContainer = getListContainer(collection);
            controller.setListContainer(listContainer);

            const triggers = Array.from(listContainer.querySelectorAll(`.${TriggerClass}`)) as HTMLElement[];
            assert.equal(triggers.length, 2);
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '100px');
            assert.equal(triggers[1].style.bottom, '100px');
        });

        it('not find triggers => should error', () => {
            const collection = getCollection([{key: 1}]);
            const listContainer = getListContainer(collection, null, true);
            controller.setListContainer(listContainer);

            const triggers = Array.from(listContainer.querySelectorAll(`.${TriggerClass}`)) as HTMLElement[];
            assert.equal(triggers.length, 0);
            assert.isTrue(stubLoggerError.called);
        });

        it('with nested lists, not should update triggers in nested list', () => {
            const collection = getCollection([{key: 1}]);
            const nestedCollection = getCollection([{key: 11}]);
            const listContainer = getListContainerWithNestedList(collection, nestedCollection);
            controller.setListContainer(listContainer);

            const triggers = Array.from(listContainer.querySelectorAll(`.${TriggerClass}`)) as HTMLElement[];
            assert.equal(triggers.length, 4);
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[2].style.display, '');
            assert.equal(triggers[3].style.display, '');

            assert.equal(triggers[0].style.top, '100px');

            assert.equal(triggers[1].style.top, '');
            assert.equal(triggers[1].style.bottom, '');
            assert.equal(triggers[2].style.top, '');
            assert.equal(triggers[2].style.bottom, '');

            assert.equal(triggers[3].style.bottom, '100px');
        });
    });

    describe('setViewportSize', () => {
        it('should recalculate triggers offsets and set their to triggers', () => {
            const newOffsets = controller.setViewportSize(600);
            assert.deepEqual(newOffsets, {backward: 200, forward: 200});

            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '200px');
            assert.equal(triggers[1].style.bottom, '200px');
        });
    });

    describe('setBackwardTriggerPosition', () => {
        it('should recalculate triggers offsets and set their to triggers', () => {
            let newOffsets = controller.setBackwardTriggerPosition('null');
            assert.deepEqual(newOffsets, {backward: 0, forward: 100});
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '0px');
            assert.equal(triggers[1].style.bottom, '100px');

            newOffsets = controller.setBackwardTriggerPosition('offset');
            assert.deepEqual(newOffsets, {backward: 100, forward: 100});
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '100px');
            assert.equal(triggers[1].style.bottom, '100px');
        });
    });

    describe('setForwardTriggerPosition', () => {
        it('should recalculate triggers offsets and set their to triggers', () => {
            let newOffsets = controller.setForwardTriggerPosition('null');
            assert.deepEqual(newOffsets, {backward: 100, forward: 0});
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '100px');
            assert.equal(triggers[1].style.bottom, '0px');

            newOffsets = controller.setForwardTriggerPosition('offset');
            assert.deepEqual(newOffsets, {backward: 100, forward: 100});
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '100px');
            assert.equal(triggers[1].style.bottom, '100px');
        });
    });

    describe('setAdditionalTriggersOffsets', () => {
        it('should recalculate triggers offsets and set their to triggers', () => {
            const newOffsets = controller.setAdditionalTriggersOffsets({backward: 48, forward: 48});
            assert.deepEqual(newOffsets, {backward: 148, forward: 148});
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '148px');
            assert.equal(triggers[1].style.bottom, '148px');
        });
    });

    describe('getTriggersOffsets', () => {
        it('should return current offsets', () => {
            assert.deepEqual(controller.getTriggersOffsets(), {backward: 100, forward: 100});
        });
    });

    describe('setBackwardTriggerVisible', () => {
        it('should update dom triggers', () => {
            controller.setBackwardTriggerVisible(false);
            assert.equal(triggers[0].style.display, 'none');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '100px');
            assert.equal(triggers[1].style.bottom, '100px');

            controller.setBackwardTriggerVisible(true);
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '100px');
            assert.equal(triggers[1].style.bottom, '100px');
        });

        it('trigger has invalid display style => should error', () => {
            triggers[0].style.display = 'absolute';
            controller.setBackwardTriggerVisible(false);
            assert.isTrue(stubLoggerError.called);
        });
    });

    describe('setForwardTriggerVisible', () => {
        it('should update dom triggers', () => {
            controller.setForwardTriggerVisible(false);
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, 'none');
            assert.equal(triggers[0].style.top, '100px');
            assert.equal(triggers[1].style.bottom, '100px');

            controller.setForwardTriggerVisible(true);
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '100px');
            assert.equal(triggers[1].style.bottom, '100px');
        });
    });

    describe('resetItems', () => {
        it('should reset triggers offset', () => {
            const newOffsets = controller.resetItems();
            assert.deepEqual(newOffsets, {backward: 0, forward: 0});
            assert.equal(triggers[0].style.display, '');
            assert.equal(triggers[1].style.display, '');
            assert.equal(triggers[0].style.top, '0px');
            assert.equal(triggers[1].style.bottom, '0px');
        });
    });

    describe('checkTriggersVisibility', () => {
        it('backward trigger is visible, forward is not visible', () => {
            controller.setHasItemsOutRange({backward: false, forward: false});
            controller.setScrollPosition(50);
            controller.setContentSize(600);
            controller.checkTriggersVisibility(0);
            assert.isTrue(observersCallback.withArgs('backward').called);
            assert.isFalse(observersCallback.withArgs('forward').called);
        });

        it('backward trigger is not visible, forward is visible', () => {
            controller.setHasItemsOutRange({backward: false, forward: false});
            controller.setScrollPosition(300);
            controller.setContentSize(600);
            controller.checkTriggersVisibility(0);
            assert.isFalse(observersCallback.withArgs('backward').called);
            assert.isTrue(observersCallback.withArgs('forward').called);
        });

        it('backward trigger is visible, forward is visible => should call only forward callback', () => {
            controller.setHasItemsOutRange({backward: false, forward: false});
            controller.setScrollPosition(0);
            controller.setContentSize(300);
            controller.checkTriggersVisibility(0);
            // вперед нет данных, поэтмоу триггер назад сразу вызывается
            assert.isTrue(observersCallback.withArgs('backward').called);
            assert.isTrue(observersCallback.withArgs('forward').called);

            observersCallback.resetHistory();
            controller.setHasItemsOutRange({backward: false, forward: true});
            controller.checkTriggersVisibility(0);
            assert.isFalse(observersCallback.withArgs('backward').called);
            assert.isTrue(observersCallback.withArgs('forward').called);
        });

        it('has content size before list', () => {
            controller.setHasItemsOutRange({backward: false, forward: false});
            controller.setScrollPosition(100);
            controller.setContentSize(600);
            controller.checkTriggersVisibility(200);
            assert.isTrue(observersCallback.withArgs('backward').called);
            assert.isFalse(observersCallback.withArgs('forward').called);
            observersCallback.resetHistory();

            controller.setScrollPosition(350);
            controller.checkTriggersVisibility(200);
            assert.isFalse(observersCallback.withArgs('backward').called);
            assert.isFalse(observersCallback.withArgs('forward').called);
            observersCallback.resetHistory();

            controller.setScrollPosition(550);
            controller.checkTriggersVisibility(200);
            assert.isFalse(observersCallback.withArgs('backward').called);
            assert.isTrue(observersCallback.withArgs('forward').called);
        });

        it('backward trigger is visible but hidden by state, forward is not visible', () => {
            controller.setHasItemsOutRange({backward: false, forward: false});
            controller.setBackwardTriggerVisible(false);
            controller.setScrollPosition(50);
            controller.setContentSize(600);
            controller.checkTriggersVisibility(0);
            assert.isFalse(observersCallback.withArgs('backward').called);
            assert.isFalse(observersCallback.withArgs('forward').called);
        });

        it('backward trigger is not visible, forward is visible but hidden by state', () => {
            controller.setHasItemsOutRange({backward: false, forward: false});
            controller.setForwardTriggerVisible(false);
            controller.setScrollPosition(300);
            controller.setContentSize(600);
            controller.checkTriggersVisibility(0);
            assert.isFalse(observersCallback.withArgs('backward').called);
            assert.isFalse(observersCallback.withArgs('forward').called);
        });
    });
});
