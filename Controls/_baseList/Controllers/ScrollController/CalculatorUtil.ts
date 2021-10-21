import type { IRange } from './Calculator';
import type { IItemsSizes } from './ItemsSizeController';
import type { IDirection } from './ScrollController';

export interface IGetRangeBaseParams {
    pageSize: number;
    totalCount: number;
}

export interface IGetRangeByIndexParams extends IGetRangeBaseParams {
    start: number;
}

export interface IShiftRangeBySegmentParams extends IGetRangeBaseParams {
    segmentSize: number;
    direction: IDirection;
    currentRange: IRange;
}

export interface IGetRangeByPositionParams extends IGetRangeBaseParams {
    itemsSizes: IItemsSizes;
    scrollPosition: number;
    triggerOffset: number;
}

/**
 * Расчет видимых индексов от переданного индекса
 * @param {IShiftRangeBySegmentParams} params
 */
export function shiftRangeBySegment(params: IShiftRangeBySegmentParams): IRange {
    const { direction, segmentSize, totalCount, pageSize, currentRange } = params;
    const fixedSegmentSize = Math
        .min(segmentSize, Math.max(pageSize - (currentRange.endIndex - currentRange.startIndex), 0));

    let { startIndex, endIndex } = currentRange;

    // TODO Совместимость, пока виртуальный скролл не включен у всех безусловно
    if (!pageSize) {
        startIndex = 0;
        endIndex = totalCount;
    } else if (direction === 'backward') {
        startIndex = Math.max(0, startIndex - fixedSegmentSize);
        if (startIndex >= totalCount) {
            startIndex = Math.max(0, totalCount - pageSize);
        }
        endIndex = Math.min(totalCount, Math.max(currentRange.endIndex, startIndex + pageSize));
    } else {
        endIndex = Math.min(endIndex + fixedSegmentSize, totalCount);
    }

    return {
        startIndex: start, endIndex: end
    };
}

/**
 * Расчет видимых индексов от переданного индекса
 * @param {IGetRangeByIndexParams} params
 */
export function getRangeByIndex(params: IGetRangeByIndexParams): IRange {
    const { start, pageSize, totalCount } = params;
    const result: IRange = { startIndex: 0, endIndex: 0 };

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
 * @param {IGetRangeByPositionParams} params
 */
export function getRangeByScrollPosition(params: IGetRangeByPositionParams): IRange {
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

export function getActiveElementIndexByPosition(params: IGetRangeByPositionParams): number {
    // todo это всё надо переписывать

    /*
    const {viewport, scroll} = this._containerHeightsData;
    let fixedScrollTop: number;

    // На тач устройствах scroll может заходить за пределы границ контейнера,
    // такие ситуации нужно корректировать под крайние максимальные и минимальные значения
    // scrollTop
    if (scrollTop < 0) {
        fixedScrollTop = 0;
    } else if (viewport + scrollTop > scroll) {
        fixedScrollTop = scroll - viewport;
    } else {
        fixedScrollTop = scrollTop;
    }

    if (!this._itemsCount) {
        return undefined;
    } else if (this.isRangeOnEdge('up') && fixedScrollTop === 0) {
        return this._range.start;
    } else if (this.isRangeOnEdge('down') && fixedScrollTop + viewport === scroll) {
        return this._range.stop - 1;
    } else {
        let itemIndex;
        const { itemsOffsets } = this._itemsHeightData;
        const placeholders = this._getPlaceholders();
        const scrollTopWithPlaceholder = fixedScrollTop + placeholders.top;
        const knownContentHeight = scroll + placeholders.bottom + placeholders.top;
        const indexLineRatio = scrollTopWithPlaceholder / (knownContentHeight - viewport);
        const indexLine = Math.max(MIN_RATIO_INDEX_LINE, Math.min(MAX_RATIO_INDEX_LINE, indexLineRatio));

        for (let i = this._range.start ; i < this._range.stop; i++) {
            if (itemsOffsets[i] < (fixedScrollTop + viewport * indexLine)) {
                itemIndex = i;
            } else {
                break;
            }
        }

        return itemIndex;
    }
    */

    return 0;
}
