import type { IVirtualRange } from './Calculator';

export interface ICalculateVirtualRangeParams {
    currentVirtualRange: IVirtualRange;
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
): IVirtualRange {
    const start = 0;
    const stop = start + params.segmentSize;
    return { start, stop };
}
