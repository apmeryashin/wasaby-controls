import type { ICalcMode, IItemsRange, IScrollMode } from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

/*
При подгрузке в любую из сторон:
      сохранять скролл 100% надо и 100% надо пересчитать диапазон

При добавлении в рекордсет(прикладник запушил, разворот узла, подгрузка в узел):
    =============ПРОСКРОЛЛЕН В НАЧАЛО===========
    [[[ НАЧАЛО ]]]
    1. был скролл === 0, добавили запись перед текущей первой.
            если virtualPageSize > (stop - start) - не сохранять скролл и дополнять диапазон.

    [[[ СЕРЕДИНА ]]]
    2. был скролл === 0, добавили запись после первой, перед последней.
            если virtualPageSize > (stop - start) - дополняем диапазон

    [[[ КОНЕЦ ]]]
    3. был скролл === 0, добавили запись после текущей последней.
            если virtualPageSize > (stop - start) - дополняем диапазон

    =============ПРОСКРОЛЛЕН В СЕРЕДИНУ===========
    [[[ НАЧАЛО ]]]
    4. был скролл === 100, добавили запись перед текущей первой.
            если virtualPageSize > (stop - start) - дополняем диапазон
                + нужно сохранять скролл (чтобы не прыгнуло, saveItem = 5)

    [[[ СЕРЕДИНА ]]]
    5. был скролл === 100, добавили запись после первой, но перед последней.
            если virtualPageSize > (stop - start) - дополняем диапазон
            ВСЕГДА нужно сохранять скролл
                (чтобы не прыгнуло, ведь могут добавить перед первой видимой записью)

    [[[ КОНЕЦ ]]]
    6. был скролл === 100, добавили запись после последней.
            если virtualPageSize > (stop - start) - дополняем диапазон

    =============ПРОСКРОЛЛЕН В КОНЕЦ===========
    [[[ НАЧАЛО ]]]
    7. был скролл === END, добавили запись перед текущей первой.
            если virtualPageSize > (stop - start) - дополняем диапазон
                + в случае дополнения нужно сохранять скролл

    [[[ СЕРЕДИНА ]]]
    8. был скролл === END, добавили запись после первой перед последней.
            если virtualPageSize > (stop - start) - дополняем диапазон
            ВСЕГДА нужно сохранять скролл

    [[[ КОНЕЦ ]]]
    9. был скролл === END, добавили запись после текущей последней.
            Нужно всегда сдвигать диапазон, из-за этого записи в начале удалятся,
            в конце добавятся и на скролл влиять не нужно
            https://jsfiddle.net/alex111089/h25ba03s/
*/

export interface IGetModeParams {
    itemsLoadedByTrigger: boolean;
    newItemsIndex: number;
    range: IItemsRange;
    virtualPageSize: number;
    scrolledToBackwardEdge: boolean;
    scrolledToForwardEdge: boolean;
    portionedLoading: boolean;
}

export function getCalcMode(params: IGetModeParams): ICalcMode {
    const virtualPageSize = params.virtualPageSize;
    const virtualPageIsFilled = virtualPageSize && virtualPageSize <= params.range.endIndex - params.range.startIndex;
    const addToEnd = params.newItemsIndex >= params.range.endIndex;

    let calcMode: ICalcMode;
    if (params.portionedLoading) {
        calcMode = virtualPageIsFilled ? 'nothing' : 'shift';
    } else if (params.itemsLoadedByTrigger) {
        calcMode = 'shift';
    } else if (params.scrolledToBackwardEdge) {
        calcMode = virtualPageIsFilled ? 'nothing' : 'extend';
    } else if (params.scrolledToForwardEdge) {
        if (addToEnd) {
            calcMode = 'shift';
        } else {
            calcMode = virtualPageIsFilled ? 'nothing' : 'extend';
        }
    } else {
        // список проскроллен не в начало и не в конец
        // Если виртуальная страница заполнена, то не нужно смещать диапазон, добавленная запись должна:
        // 1. Если добавлена в диапазон, то выместить собой запись в конце диапазона(не нужно пересчитывать диапазон)
        // 2. Если добавлена вне диапазона, то ничего не делать
        calcMode = virtualPageIsFilled ? 'nothing' : 'shift';
    }

    return calcMode;
}

export function getScrollMode(params: IGetModeParams): IScrollMode {
    const virtualPageSize = params.virtualPageSize;
    const virtualPageIsFilled = virtualPageSize && virtualPageSize <= params.range.endIndex - params.range.startIndex;
    const addToStart = params.newItemsIndex <= params.range.endIndex;
    const addToEnd = params.newItemsIndex >= params.range.endIndex;
    const addToMiddle = !addToStart && !addToEnd;

    let scrollMode: IScrollMode;
    if (params.itemsLoadedByTrigger) {
        scrollMode = 'fixed';
    } else if (params.scrolledToBackwardEdge) {
        scrollMode = 'unfixed';
    } else if (params.scrolledToForwardEdge) {
        scrollMode = addToStart && !virtualPageIsFilled || addToMiddle ? 'fixed' : 'unfixed';
    } else {
        // список проскроллен не в начало и не в конец
        scrollMode = 'fixed';
    }

    return scrollMode;
}
