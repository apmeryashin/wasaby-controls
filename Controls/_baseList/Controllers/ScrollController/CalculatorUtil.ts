import type { IItemsSizes } from './ItemsSizeController';
import type { IDirection, IItemsRange } from './ScrollController';
import type { IPlaceholders } from './Calculator';

const MIN_RATIO_INDEX_LINE = 0.15;
const MAX_RATIO_INDEX_LINE = 0.85;

export interface IGetRangeByIndexParams {
    start: number;
    pageSize: number;
    totalCount: number;
}

export interface IShiftRangeBySegmentParams {
    pageSize: number;
    totalCount: number;
    segmentSize: number;
    direction: IDirection;
    currentRange: IItemsRange;
}

export interface IGetByPositionParams {
    pageSize: number;
    totalCount: number;
    itemsSizes: IItemsSizes;
    scrollPosition: number;
    triggerOffset: number;
}

export interface IGetActiveElementIndexByPosition {
    totalCount: number;
    itemsSizes: IItemsSizes;
    scrollPosition: number;
    viewportSize: number;
    contentSize: number;
    placeholders: IPlaceholders;
    currentRange: IItemsRange;
}

/**
 * Расчет видимых индексов от переданного индекса
 * @param {IShiftRangeBySegmentParams} params
 */
export function shiftRangeBySegment(params: IShiftRangeBySegmentParams): IItemsRange {
    const { direction, segmentSize, totalCount, pageSize, currentRange } = params;
    const fixedSegmentSize = Math
        .min(segmentSize, Math.max(pageSize - (currentRange.endIndex - currentRange.startIndex), 0));

    let { startIndex, endIndex } = currentRange;

    if (direction === 'backward') {
        startIndex = Math.max(0, startIndex - fixedSegmentSize);
        if (startIndex >= totalCount) {
            startIndex = Math.max(0, totalCount - pageSize);
        }
        endIndex = Math.min(totalCount, Math.max(currentRange.endIndex, startIndex + pageSize));
    } else {
        endIndex = Math.min(endIndex + fixedSegmentSize, totalCount);
    }

    return {
        startIndex, endIndex
    };
}

/**
 * Расчет видимых индексов от переданного индекса
 * @param {IGetRangeByIndexParams} params
 */
export function getRangeByIndex(params: IGetRangeByIndexParams): IItemsRange {
    const { start, pageSize, totalCount } = params;
    const result: IItemsRange = { startIndex: 0, endIndex: 0 };

    if (pageSize && pageSize < totalCount) {
        result.startIndex = start;
        result.endIndex = start + pageSize;

        if (result.endIndex >= totalCount) {
            result.endIndex = totalCount;
            result.startIndex = result.endIndex - pageSize;
        }
    } else {
        result.startIndex = 0;
        result.endIndex = totalCount;
    }

    return result;
}

/**
 * Рассчет видимых индексов от позиции скролла
 * @param {IGetByPositionParams} params
 */
export function getRangeByScrollPosition(params: IGetByPositionParams): IItemsRange {
    const { pageSize, totalCount, itemsSizes, triggerOffset, scrollPosition } = params;

    let start: number = 0;
    let end: number;
    let tempPlaceholderSize = 0;

    while (tempPlaceholderSize + itemsSizes[start].height <= scrollPosition - triggerOffset) {
        tempPlaceholderSize += itemsSizes[start].height;
        start++;
    }
    if (pageSize) {
        start = Math.max(start - (Math.trunc(pageSize / 2)), 0);
        end = Math.min(start + pageSize, totalCount);
    } else {
        start = 0;
        end = totalCount;
    }

    // Если мы скроллим быстро к концу списка, startIndex может вычислиться такой,
    // что число отрисовываемых записей будет меньше virtualPageSize (например если
    // в списке из 100 записей по scrollTop вычисляется startIndex == 95, то endIndex
    // будет равен 100 при любом virtualPageSize >= 5.
    // Нам нужно всегда рендерить virtualPageSize записей, если это возможно, т. е. когда
    // в коллекции достаточно записей. Поэтому если мы находимся в конце списка, пробуем
    // отодвинуть startIndex назад так, чтобы отрисовывалось нужное число записей.
    if (pageSize && end === totalCount) {
        const missingCount = pageSize - (end - start);
        if (missingCount > 0) {
            start = Math.max(start - missingCount, 0);
        }
    }
    return { startIndex: start, endIndex: end };
}

/**
 * Расчёт активного элемента от позиции скролла
 * @param {IGetActiveElementIndexByPosition} params
 */
export function getActiveElementIndexByScrollPosition(params: IGetActiveElementIndexByPosition): number {
    const { viewportSize, contentSize, scrollPosition, itemsSizes, placeholders, totalCount, currentRange } = params;

    let fixedScrollPosition: number;

    // На тач устройствах scroll может заходить за пределы границ контейнера.
    // Такие ситуации нужно корректировать под крайние максимальные и минимальные значения scrollTop
    if (scrollPosition < 0) {
        fixedScrollPosition = 0;
    } else if (viewportSize + scrollPosition > contentSize) {
        fixedScrollPosition = contentSize - viewportSize;
    } else {
        fixedScrollPosition = scrollPosition;
    }

    if (!totalCount) {
        return undefined;
    } else if (isRangeOnEdge('backward', currentRange, totalCount)
        && fixedScrollPosition === 0) {
        return currentRange.startIndex;
    } else if (isRangeOnEdge('forward', currentRange, totalCount)
        && fixedScrollPosition + viewportSize === contentSize) {
        return currentRange.endIndex - 1;
    } else {
        let activeElementIndex;
        const scrollTopWithPlaceholder = fixedScrollPosition + placeholders.top;
        const knownContentHeight = contentSize + placeholders.bottom + placeholders.top;
        const indexLineRatio = scrollTopWithPlaceholder / (knownContentHeight - viewportSize);
        const indexLine = Math.max(MIN_RATIO_INDEX_LINE, Math.min(MAX_RATIO_INDEX_LINE, indexLineRatio));

        for (let i = currentRange.startIndex ; i < currentRange.endIndex; i++) {
            if (itemsSizes[i].offsetTop < (fixedScrollPosition + viewportSize * indexLine)) {
                activeElementIndex = i;
            } else {
                break;
            }
        }

        return activeElementIndex;
    }
}

/**
 * Проверяет что диапазон находится на переданном краю
 * @param edge
 */
function isRangeOnEdge(edge: IDirection, range: IItemsRange, totalCount: number): boolean {
    return edge === 'backward' ? range.startIndex === 0 : range.endIndex === totalCount;
}
