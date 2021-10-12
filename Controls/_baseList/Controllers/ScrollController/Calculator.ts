// import { calculateVirtualRange } from './VirtualScrollUtil';

export interface ICalculatorOptions {
    segmentSize: number;
}

export interface IVirtualRange {
    start: number;
    stop: number;
}

/**
 * Класс предназначен для:
 *  - сбора, хранения и актуализации любых параметров scroll: scrollTop, размер viewPort, элементов и контента;
 *  - применение индексов virtual scroll на модель;
 *  - вычисление размеров virtual placeholders.
 */
export class Calculator {
    _range: IVirtualRange;
    _segmentSize: number;

    constructor(options: ICalculatorOptions) {
        this._segmentSize = options.segmentSize;
    }

    // private _updateVirtualRange(): void {
    //     this._range = calculateVirtualRange({
    //         currentVirtualRange: this._range,
    //         segmentSize: this._segmentSize
    //     });
    // }
}
