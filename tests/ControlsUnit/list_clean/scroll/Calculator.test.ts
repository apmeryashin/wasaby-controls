import { assert } from 'chai';
import { spy } from 'sinon';
import {Calculator, ICalculatorOptions} from 'Controls/_baseList/Controllers/ScrollController/Calculator';

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
                {size: 50, offset: 0},
                {size: 50, offset: 50},
                {size: 50, offset: 100},
                {size: 50, offset: 150},
                {size: 50, offset: 200},
                {size: 50, offset: 250},
                {size: 50, offset: 300},
                {size: 50, offset: 350},
                {size: 50, offset: 400},
                {size: 50, offset: 450}
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
                    {size: 50, offset: 0},
                    {size: 50, offset: 50},
                    {size: 50, offset: 100},
                    {size: 50, offset: 150},
                    {size: 50, offset: 200},
                    {size: 50, offset: 250},
                    {size: 50, offset: 300},
                    {size: 50, offset: 350},
                    {size: 50, offset: 400},
                    {size: 50, offset: 450}
                ]
            );
            calculator.addItems(0, 5, 'shift');
            assert.isTrue(calculator.hasItemsOutRange('backward'));
         });
    });

    describe('getEdgeVisibleItem', () => {
        it('viewport is not filled, items is not all rendered, edge item should be last rendered item', () => {
            const controller = getCalculator({
                totalCount: 15,
                viewportSize: 500,
                contentSize: 400,
                itemsSizes: [
                    {size: 50, offset: 0},
                    {size: 50, offset: 50},
                    {size: 50, offset: 100},
                    {size: 50, offset: 150},
                    {size: 50, offset: 200},
                    {size: 50, offset: 250},
                    {size: 50, offset: 300},
                    {size: 50, offset: 350},
                    {size: 50, offset: 400},
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
                index: 8,
                direction: 'forward',
                border: 'backward',
                borderDistance: 100
            });
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
                    {size: 50, offset: 650},
                    {size: 50, offset: 700}
                ]
            );
            calculator.addItems(10, 5, 'shift');
            calculator.scrollPositionChange(50, false);
            assert.equal(calculator.getFirstVisibleItemIndex(), 4);
        });
    });
});
