import { assert } from 'chai';
import { spy } from 'sinon';
import {Calculator, ICalculatorOptions} from 'Controls/_baseList/Controllers/ScrollController/Calculator';

const EMPTY_SIZE = {size: 0, offset: 0};

function getDefaultControllerOptions(): ICalculatorOptions {
    return {
        scrollPosition: 0,
        contentSize: 0,
        viewportSize: 0,
        totalCount: 0,
        givenItemsSizes: undefined,
        itemsSizes: [],
        triggersOffsets: {backward: 0, forward: 0},
        virtualScrollConfig: {},
        feature1183225611: false
    };
}

function getCalculator(options: Partial<ICalculatorOptions>): Calculator {
    return new Calculator({
        ...getDefaultControllerOptions(),
        ...options
    });
}

describe('Controls/_baseList/Controllers/Calculator', () => {
    let calculator: Calculator;

    beforeEach(() => {
        calculator = getCalculator({
            totalCount: 10,
            viewportSize: 300,
            contentSize: 500,
            scrollPosition: 0,
            itemsSizes: [
                {size: 50, offset: 0, key: '1'},
                {size: 50, offset: 50, key: '2'},
                {size: 50, offset: 100, key: '3'},
                {size: 50, offset: 150, key: '4'},
                {size: 50, offset: 200, key: '5'},
                {size: 50, offset: 250, key: '6'},
                {size: 50, offset: 300, key: '7'},
                {size: 50, offset: 350, key: '8'},
                {size: 50, offset: 400, key: '9'},
                {size: 50, offset: 450, key: '10'}
            ],
            virtualScrollConfig: {
                pageSize: 10
            }
        });
        calculator.resetItems(10, 0);
    });

    afterEach(() => {
        calculator = null;
    });

    describe('getRange', () => {
         it('should return current range', () => {
            assert.deepEqual(calculator.getRange(), {startIndex: 0, endIndex: 10});
         });
    });

    describe('getTotalItemsCount', () => {
         it('should return total items count', () => {
            assert.deepEqual(calculator.getTotalItemsCount(), 10);
         });
    });

    describe('hasItemsOutRange', () => {
         it('not has items out range', () => {
            assert.isFalse(calculator.hasItemsOutRange('backward'));
            assert.isFalse(calculator.hasItemsOutRange('forward'));
         });

         it('has items out range to forward', () => {
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );
            calculator.addItems(10, 5, 'shift');
            assert.isTrue(calculator.hasItemsOutRange('forward'));
         });

         it('has items out range to backward', () => {
            calculator.updateItemsSizes(
                [
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'}
                ]
            );
            calculator.addItems(0, 5, 'shift');
            assert.isTrue(calculator.hasItemsOutRange('backward'));
         });
    });

    describe('getFirstVisibleItemIndex', () => {
        it('not scrolled list', () => {
            assert.equal(calculator.getFirstVisibleItemIndex(), 0);
        });

        it('scrolled list', () => {
            calculator.scrollPositionChange(130, false);
            assert.equal(calculator.getFirstVisibleItemIndex(), 3);
        });

        it('has backward placeholder', () => {
            calculator.scrollPositionChange(200, false);
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 50, offset: 500, key: '11'},
                    {size: 50, offset: 550, key: '12'},
                    {size: 50, offset: 600, key: '13'},
                    {size: 50, offset: 650, key: '14'},
                    {size: 50, offset: 700, key: '15'}
                ]
            );
            calculator.addItems(10, 5, 'shift');
            calculator.scrollPositionChange(50, false);
            assert.equal(calculator.getFirstVisibleItemIndex(), 4);
        });
    });

    describe('getEdgeVisibleItem', () => {
        it('list is scrolled, backward edge item', () => {
            calculator.scrollPositionChange(130, false);
            const edgeItem = calculator.getEdgeVisibleItem({ direction: 'backward' });
            assert.deepEqual(edgeItem, {
                key: '3',
                direction: 'backward',
                borderDistance: 20,
                border: 'forward'
            });
        });

        it('list is scrolled, forward edge item', () => {
            calculator.scrollPositionChange(130, false);
            const edgeItem = calculator.getEdgeVisibleItem({ direction: 'forward' });
            assert.deepEqual(edgeItem, {
                key: '9',
                direction: 'forward',
                borderDistance: 30,
                border: 'backward'
            });
        });

        it('list is scrolled, backward edge item, pass full params', () => {
            calculator.scrollPositionChange(130, false);
            const edgeItem = calculator.getEdgeVisibleItem({
                direction: 'backward',
                range: {startIndex: 3, endIndex: 8},
                placeholders: {backward: 150, forward: 100}
            });
            assert.deepEqual(edgeItem, {
                key: '6',
                direction: 'backward',
                borderDistance: 20,
                border: 'forward'
            });
        });

        it('list is scrolled, forward edge item, pass full params', () => {
            calculator.scrollPositionChange(130, false);
            const edgeItem = calculator.getEdgeVisibleItem({
                direction: 'forward',
                range: {startIndex: 3, endIndex: 8},
                placeholders: {backward: 150, forward: 150}
            });
            assert.deepEqual(edgeItem, {
                key: '8',
                direction: 'forward',
                borderDistance: 230,
                border: 'backward'
            });
        });

        it('viewport is not filled, items is not all rendered, edge item should be last rendered item', () => {
            const controller = getCalculator({
                totalCount: 15,
                viewportSize: 500,
                contentSize: 400,
                itemsSizes: [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            });

            const edgeItem = controller.getEdgeVisibleItem({
                range: {startIndex: 0, endIndex: 15},
                direction: 'forward',
                placeholders: {backward: 0, forward: 0}
            });
            assert.deepEqual(edgeItem, {
                key: '9',
                direction: 'forward',
                border: 'backward',
                borderDistance: 100
            });
        });
    });

    describe('getScrollPositionToEdgeItem', () => {
        it('backward edge item, backward border', () => {
            const scrollPosition = calculator.getScrollPositionToEdgeItem({
                key: '4',
                border: 'backward',
                borderDistance: 30,
                direction: 'backward'
            });
            assert.equal(scrollPosition, 180);
        });

        it('backward edge item, forward border', () => {
            const scrollPosition = calculator.getScrollPositionToEdgeItem({
                key: '4',
                border: 'forward',
                borderDistance: 30,
                direction: 'backward'
            });
            assert.equal(scrollPosition, 170);
        });

        it('forward edge item', () => {
            const scrollPosition = calculator.getScrollPositionToEdgeItem({
                key: '9',
                border: 'backward',
                borderDistance: 30,
                direction: 'forward'
            });
            assert.equal(scrollPosition, 130);
        });

        it('backward edge item and list scrolled', () => {
            calculator.scrollPositionChange(100, false);
            const scrollPosition = calculator.getScrollPositionToEdgeItem({
                key: '5',
                border: 'backward',
                borderDistance: 30,
                direction: 'backward'
            });
            assert.equal(scrollPosition, 230);
        });
    });

    describe('shiftRangeToDirection', () => {
        it('not has items to forward', () => {
            const result = calculator.shiftRangeToDirection('forward');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 10},
                shiftDirection: 'forward',
                indexesChanged: false,
                forwardPlaceholderSize: 0,
                backwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {forward: 0, backward: 0},
                scrollMode: null
            });
        });

        it('not has items to backward', () => {
            const result = calculator.shiftRangeToDirection('backward');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 10},
                shiftDirection: 'backward',
                indexesChanged: false,
                forwardPlaceholderSize: 0,
                backwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {forward: 0, backward: 0},
                scrollMode: null
            });
        });

        it('has items to forward', () => {
            calculator.scrollPositionChange(200, false);
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0},
                    {size: 50, offset: 50},
                    {size: 50, offset: 100},
                    {size: 50, offset: 150},
                    {size: 50, offset: 200},
                    {size: 50, offset: 250},
                    {size: 50, offset: 300},
                    {size: 50, offset: 350},
                    {size: 50, offset: 400},
                    {size: 50, offset: 450},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );
            calculator.addItems(10, 5, 'shift');
            calculator.setContentSize(600);
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0},
                    {size: 50, offset: 50},
                    {size: 50, offset: 100},
                    {size: 50, offset: 150},
                    {size: 50, offset: 200},
                    {size: 50, offset: 250},
                    {size: 50, offset: 300},
                    {size: 50, offset: 350},
                    {size: 50, offset: 400},
                    {size: 50, offset: 450},
                    {size: 50, offset: 500},
                    {size: 50, offset: 550},
                    {size: 50, offset: 600},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );

            calculator.scrollPositionChange(300, false);
            const result = calculator.shiftRangeToDirection('forward');
            assert.deepEqual(result, {
                range: {startIndex: 5, endIndex: 15},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 250,
                forwardPlaceholderSize: 0,
                placeholdersChanged: true,
                hasItemsOutRangeBackward: true,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: true,
                oldRange: {startIndex: 3, endIndex: 13},
                oldPlaceholders: {backward: 150, forward: 0},
                scrollMode: null
            });
        });

        it('has items to backward', () => {
            calculator.updateItemsSizes(
                [
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'}
                ]
            );
            calculator.addItems(0, 5, 'shift');
            calculator.setContentSize(600);
            calculator.updateItemsSizes(
                [
                    {size: 0, offset: 0, key: '0'},
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 550, key: '10'},
                    {size: 50, offset: 600, key: '11'},
                    {size: 50, offset: 650, key: '12'},
                    {size: 50, offset: 700, key: '13'},
                    {size: 50, offset: 750, key: '14'}
                ]
            );
            // якобы восстановился скролл
            calculator.scrollPositionChange(150, false);
            // проскроллили
            calculator.scrollPositionChange(0, false);

            const result = calculator.shiftRangeToDirection('backward');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 10},
                shiftDirection: 'backward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 250,
                placeholdersChanged: true,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: true,
                hasItemsOutRangeChanged: true,
                oldRange: {startIndex: 2, endIndex: 12},
                oldPlaceholders: {backward: 0, forward: 150},
                scrollMode: null
            });
        });
    });

    describe('shiftRangeToIndex', () => {
        it('item in range => indexes is not changed', () => {
            const result = calculator.shiftRangeToIndex(3);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 10},
                shiftDirection: null,
                indexesChanged: false,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('item not in range => indexes is changed', () => {
            calculator.scrollPositionChange(200, false);
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );
            calculator.addItems(10, 5, 'shift');
            calculator.setContentSize(600);
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 50, offset: 500, key: '11'},
                    {size: 50, offset: 550, key: '12'},
                    {size: 50, offset: 600, key: '13'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );

            const result = calculator.shiftRangeToIndex(14);
            assert.deepEqual(result, {
                range: {startIndex: 5, endIndex: 15},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 250,
                forwardPlaceholderSize: 0,
                placeholdersChanged: true,
                hasItemsOutRangeBackward: true,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: true,
                oldRange: {startIndex: 3, endIndex: 13},
                oldPlaceholders: {backward: 150, forward: 0},
                scrollMode: null
            });
        });
    });

    describe('shiftRangeToVirtualScrollPosition', () => {
        it('scroll position is not changed', () => {
            const result = calculator.shiftRangeToVirtualScrollPosition(0);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 10},
                shiftDirection: null,
                indexesChanged: false,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('shift range', () => {
            calculator.scrollPositionChange(200, false);
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );
            calculator.addItems(10, 5, 'shift');
            calculator.setContentSize(600);
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 50, offset: 500, key: '11'},
                    {size: 50, offset: 550, key: '12'},
                    {size: 50, offset: 600, key: '13'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );

            calculator.scrollPositionChange(300, false);
            calculator.shiftRangeToDirection('forward');
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 50, offset: 500, key: '11'},
                    {size: 50, offset: 550, key: '12'},
                    {size: 50, offset: 600, key: '13'},
                    {size: 50, offset: 650, key: '14'},
                    {size: 50, offset: 700, key: '15'}
                ]
            );

            const result = calculator.shiftRangeToVirtualScrollPosition(0);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 10},
                shiftDirection: null,
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 250,
                placeholdersChanged: true,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: true,
                hasItemsOutRangeChanged: true,
                oldRange: {startIndex: 5, endIndex: 15},
                oldPlaceholders: {backward: 250, forward: 0},
                scrollMode: null
            });
        });
    });

    describe('scrollPositionChange', () => {
        it('scroll position is not changed', () => {
            const result = calculator.scrollPositionChange(0, true);
            assert.deepEqual(result, {
                activeElementIndex: undefined,
                activeElementIndexChanged: false
            });
        });

        it('scroll position is changed', () => {
            const result = calculator.scrollPositionChange(130, true);
            assert.deepEqual(result, {
                activeElementIndex: 6,
                activeElementIndexChanged: true
            });
        });

        it('not update active element', () => {
            const result = calculator.scrollPositionChange(130, false);
            assert.deepEqual(result, {
                activeElementIndex: undefined,
                activeElementIndexChanged: false
            });
        });

        it('scroll position outside of max values', () => {
            let result = calculator.scrollPositionChange(-20, true);
            assert.deepEqual(result, {
                activeElementIndex: 0,
                activeElementIndexChanged: true
            });

            result = calculator.scrollPositionChange(2000, true);
            assert.deepEqual(result, {
                activeElementIndex: 9,
                activeElementIndexChanged: true
            });
        });

        it('not has items', () => {
            calculator.resetItems(0, 0);
            const result = calculator.scrollPositionChange(130, true);
            assert.deepEqual(result, {
                activeElementIndex: undefined,
                activeElementIndexChanged: false
            });
        });

        it('enabled feature for active element', () => {
            const calculator = getCalculator({
                totalCount: 10,
                viewportSize: 300,
                contentSize: 500,
                scrollPosition: 0,
                itemsSizes: [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'}
                ],
                virtualScrollConfig: {
                    pageSize: 10
                },
                feature1183225611: true
            });
            calculator.resetItems(10, 0);

            const result = calculator.scrollPositionChange(130, true);
            assert.deepEqual(result, {
                activeElementIndex: 2,
                activeElementIndexChanged: true
            });
        });
    });

    describe('addItems', () => {
        it('add to start', () => {
            calculator.updateItemsSizes(
                [
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'}
                ]
            );
            const result = calculator.addItems(0, 5, 'shift');
            assert.deepEqual(result, {
                range: {startIndex: 2, endIndex: 12},
                shiftDirection: 'backward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 150,
                placeholdersChanged: true,
                hasItemsOutRangeBackward: true,
                hasItemsOutRangeForward: true,
                hasItemsOutRangeChanged: true,
                oldRange: {startIndex: 5, endIndex: 15},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('add to middle', () => {
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 0, offset: 0},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'}
                ]
            );
            const result = calculator.addItems(5, 1, 'shift');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 11},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('add to end', () => {
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );
            const result = calculator.addItems(10, 5, 'shift');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 13},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: true,
                hasItemsOutRangeChanged: true,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });
    });

    describe('removeItems', () => {
        it('remove from start', () => {
            const result = calculator.removeItems(0, 1);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 9},
                shiftDirection: 'backward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('remove from middle', () => {
            const result = calculator.removeItems(5, 1);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 9},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('remove from end', () => {
            const result = calculator.removeItems(9, 1);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 9},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });
    });

    describe('resetItems', () => {
        it('start with 0', () => {
            calculator.updateItemsSizes(Array(20).fill(EMPTY_SIZE));
            calculator.resetItems(20, 0);
            assert.deepEqual(calculator.getRange(), {startIndex: 0, endIndex: 10});
        });

        it('start with 5', () => {
            calculator.updateItemsSizes(Array(20).fill(EMPTY_SIZE));
            calculator.resetItems(20, 5);
            assert.deepEqual(calculator.getRange(), {startIndex: 5, endIndex: 15});
        });

        it('pass givenItemsSizes', () => {
            calculator.updateGivenItemsSizes([
                {size: 50, offset: 0, key: '1'},
                {size: 50, offset: 50, key: '2'},
                {size: 50, offset: 100, key: '3'},
                {size: 50, offset: 150, key: '4'},
                {size: 50, offset: 200, key: '5'},
                {size: 50, offset: 250, key: '6'},
                {size: 50, offset: 300, key: '7'},
                {size: 50, offset: 350, key: '8'},
                {size: 50, offset: 400, key: '9'},
                {size: 50, offset: 450, key: '10'}
            ]);
            calculator.resetItems(10, 0);
            assert.deepEqual(calculator.getRange(), {startIndex: 0, endIndex: 7});

            calculator.resetItems(5, 2);
            assert.deepEqual(calculator.getRange(), {startIndex: 2, endIndex: 5});
        });
    });
});
