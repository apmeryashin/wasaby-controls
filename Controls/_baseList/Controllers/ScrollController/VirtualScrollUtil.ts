import type { IRange } from './Calculator';

export interface ICalculateVirtualRangeParams {
    currentVirtualRange: IRange;
    segmentSize: number;
}

/**
 * Класс предназначен для:
 *  - первоначального расчёта virtual indexes;
 *  - расчет индексов при scroll;
 *  - расчет индексов при scroll к определенной записи.
 */
export function calculateVirtualRange(
    params: ICalculateVirtualRangeParams
): IRange {
    const start = 0;
    const stop = start + params.segmentSize;
    return { start, end: stop };
}
