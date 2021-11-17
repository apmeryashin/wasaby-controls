import type { IItemsSizes } from './ItemsSizeController';
import type { IDirection, IItemsRange, IPlaceholders } from './ScrollController';

const MIN_RATIO_INDEX_LINE = 0.15;
const MAX_RATIO_INDEX_LINE = 0.85;

export interface IGetRangeByIndexParams {
    start: number;
    pageSize: number;
    totalCount: number;
}

export interface IGetRangeByItemsSizesParams {
    start: number;
    totalCount: number;
    viewportSize: number;
    itemsSizes: IItemsSizes;
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

export interface IGetSizesByRangeParams {
    range: IItemsRange;
    itemsSizes: IItemsSizes;
    totalCount: number;
}

/**
 * Расчет видимых индексов от переданного индекса
 * @param {IShiftRangeBySegmentParams} params
 */
export function shiftRangeBySegment(params: IShiftRangeBySegmentParams): IItemsRange {
    const { direction, segmentSize, totalCount, pageSize, currentRange } = params;
    let { startIndex, endIndex } = currentRange;

    if (segmentSize && totalCount >= pageSize) {
        if (direction === 'backward') {
            startIndex = Math.max(0, startIndex - segmentSize);
            if (startIndex >= totalCount) {
                startIndex = Math.max(0, totalCount - pageSize);
            }

            endIndex = Math.max(endIndex - segmentSize, Math.min(startIndex + pageSize, totalCount));
        } else {
            endIndex = Math.min(endIndex + segmentSize, totalCount);
            startIndex = Math.min(startIndex + segmentSize, Math.max(endIndex - pageSize, 0));
        }
    }

    if (endIndex < pageSize && endIndex < totalCount) {
        endIndex = Math.min(pageSize, totalCount);
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
 * Расчет видимых индексов от заранее высчитанных высот.
 * @remark
 * Используется для оптимизаций частных случаев, когда построить один лишний элемент будет очень дорого,
 * например если один элемент это огромный пункт с кучей контролов внутри)
 * @param {IGetRangeByItemsSizesParams} params
 */
export function getRangeByItemsSizes(params: IGetRangeByItemsSizesParams): IItemsRange {
    const itemsSizes = params.itemsSizes;
    let sumHeight = 0;
    let start: number = params.start;
    let end: number;

    // Пытаемся посчитать endIndex взяв за начало переданный startIndex
    for (let i = start; i < params.totalCount; i++) {
        const itemSize = itemsSizes[i].size;
        if (sumHeight + itemSize <= params.viewportSize) {
            sumHeight += itemSize;
        } else {
            end = i;
            break;
        }
    }

    // Если endIndex не посчитался или равен последнему элементу, то
    // считаем наоборот - startIndex исходя из того что endIndex указывает на последний элемент
    if (typeof end === 'undefined' || end === params.totalCount - 1) {
        end = params.totalCount - 1;
        sumHeight = 0;

        for (let i = end; i > 0; i--) {
            const itemSize = itemsSizes[i].size;

            if (sumHeight + itemSize <= params.viewportSize) {
                sumHeight += itemSize;
            } else {
                start = i;
                break;
            }
        }
    }

    return { startIndex: start, endIndex: end};
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

    while (tempPlaceholderSize + itemsSizes[start].size <= scrollPosition - triggerOffset) {
        tempPlaceholderSize += itemsSizes[start].size;
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
    // в списке из 100 записей по scrollPosition вычисляется startIndex == 95, то endIndex
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
    // Такие ситуации нужно корректировать под крайние максимальные и минимальные значения scrollPosition
    if (scrollPosition < 0) {
        fixedScrollPosition = 0;
    } else if (viewportSize + scrollPosition > contentSize) {
        fixedScrollPosition = contentSize - viewportSize;
    } else {
        fixedScrollPosition = scrollPosition;
    }

    if (!totalCount) {
        return undefined;
    } else if (isRangeOnEdge('backward', currentRange, totalCount) && fixedScrollPosition === 0) {
        return currentRange.startIndex;
    } else if (
        isRangeOnEdge('forward', currentRange, totalCount) &&
        fixedScrollPosition + viewportSize === contentSize
    ) {
        return currentRange.endIndex - 1;
    } else {
        let activeElementIndex;
        const scrollTopWithPlaceholder = fixedScrollPosition + placeholders.backward;
        const knownContentHeight = contentSize + placeholders.forward + placeholders.backward;
        const indexLineRatio = scrollTopWithPlaceholder / (knownContentHeight - viewportSize);
        const indexLine = Math.max(MIN_RATIO_INDEX_LINE, Math.min(MAX_RATIO_INDEX_LINE, indexLineRatio));

        for (let i = currentRange.startIndex ; i < currentRange.endIndex; i++) {
            if (itemsSizes[i].offset < (fixedScrollPosition + viewportSize * indexLine)) {
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
 * @param {IDirection} edge
 * @param {IItemsRange} range
 * @param {number} totalCount
 */
function isRangeOnEdge(edge: IDirection, range: IItemsRange, totalCount: number): boolean {
    return edge === 'backward' ? range.startIndex === 0 : range.endIndex === totalCount;
}

/**
 * Рассчитывает плейсхолдеры для переданного диапазона
 * @param {IGetSizesByRangeParams} params
 */
export function getPlaceholdersByRange(params: IGetSizesByRangeParams): IPlaceholders {
    const { range, itemsSizes, totalCount } = params;

    const backward = getItemsSizesSum({
        range: { startIndex: 0, endIndex: range.startIndex },
        itemsSizes,
        totalCount
    });
    const forward = getItemsSizesSum({
        range: { startIndex: range.endIndex, endIndex: totalCount },
        itemsSizes,
        totalCount
    });

    return { backward, forward };
}

/**
 * Возвращает сумму высот элементов из указанного диапазона
 * @param {IGetSizesByRangeParams} params
 */
function getItemsSizesSum(params: IGetSizesByRangeParams): number {
    const { range, itemsSizes, totalCount } = params;
    const fixedStartIndex = Math.max(range.startIndex, 0);
    const fixedEndIndex = Math.min(range.endIndex, totalCount);

    let result = 0;

    for (let idx = fixedStartIndex; idx < fixedEndIndex; idx++) {
        result += itemsSizes[idx].size || 0;
    }

    return result;
}