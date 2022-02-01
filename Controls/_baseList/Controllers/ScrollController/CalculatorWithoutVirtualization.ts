import {Calculator, ICalculatorResult} from 'Controls/_baseList/Controllers/ScrollController/Calculator';
import type { ICalcMode, IDirection } from './ScrollController';

export default class CalculatorWithoutVirtualization extends Calculator {
    shiftRangeToDirection(direction: IDirection): ICalculatorResult {
        return this._getRangeChangeResult(this._getState(), direction);
    }

    shiftRangeToIndex(index: number): ICalculatorResult {
        return this._getRangeChangeResult(this._getState(), null);
    }

    shiftRangeToVirtualScrollPosition(scrollPosition: number): ICalculatorResult {
        return this._getRangeChangeResult(this._getState(), null);
    }

    addItems(position: number, count: number, calcMode: ICalcMode): ICalculatorResult {
        const oldState = this._getState();
        this.resetItems(this._totalCount + count, 0);
        return this._getRangeChangeResult(oldState, this._calcAddDirection(position, count));
    }

    removeItems(position: number, count: number): ICalculatorResult {
        const direction = position <= this._range.startIndex ? 'backward' : 'forward';
        const oldState = this._getState();
        this.resetItems(this._totalCount - count, 0);
        return this._getRangeChangeResult(oldState, direction);
    }
}
