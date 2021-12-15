// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as DataContext from 'Core/DataContext';
import IntersectionObserverSyntheticEntry from 'Controls/_scroll/IntersectionObserver/SyntheticEntry';

type CallbackType<T> = (pinnedData: T) => void;

/**
 * Внутренний контроллер, через который организуется связь между DataPinContainer и DataPinConsumer.
 * DataPinContainer уведомляет о пересечении с верхней границей, контроллер обрабатывает эту информацию
 * и уведомляет DataPinConsumer о новых данных.
 */
export class PinController<T = unknown> extends DataContext {

    _moduleName: string;

    protected _stack: T[] = [];

    private _callbacks: Array<CallbackType<T>> = [];

    subscribe(callback: CallbackType<T>): void {
        this._callbacks.push(callback);
    }

    unsubscribe(callback: CallbackType<T>): void {
        const index = this._callbacks.indexOf(callback);
        if (index >= 0) {
            this._callbacks.splice(index, 1);
        }
    }

    /**
     * Временный метод для очистики стека закрепленных итемов.
     * Понадобился как быстрое решение вот этой проблемы
     * https://online.sbis.ru/opendoc.html?guid=a17584db-5cc5-429f-b975-c18dbc52e601
     */
    clearStack(): void {
        this._stack = [];
        this.processIntersect({} as IntersectionObserverSyntheticEntry);
    }

    processIntersect(entries: IntersectionObserverSyntheticEntry): void {
        const pinnedData = this.updateStack([entries]);

        this._callbacks.forEach((callback) => {
            callback(pinnedData);
        });
    }

    private updateStack(entries: IntersectionObserverSyntheticEntry[]): T | null {
        // Оставляем только те записи где есть данные
        const groupsEntries = entries.filter((e) => !!e.data);

        if (!groupsEntries.length) {
            return this.getPinnedData();
        }

        // Пробегаемся по всем записям и заполняем _stack.
        // Записи приходят в том порядке в котором они расположены в DOM.
        // Нас интересуют только те записи, которые находятся выше верхней границы либо пересекаются с ней.
        groupsEntries.forEach((e) => {
            //region intersect var
            // getBoundingClientRect для ScrollContainer
            const rootBounds = e.nativeEntry.rootBounds;
            // getBoundingClientRect для элемента списка, который пересек границы ScrollContainer
            const targetBounds = e.nativeEntry.boundingClientRect;

            // true если дочерний контейнер пересекается с верхней границей
            const intersectTop = targetBounds.top < rootBounds.top && targetBounds.bottom > rootBounds.top;
            // true если дочерний контейнер находится полностью за верхней границей
            const above = targetBounds.bottom <= rootBounds.top;
            //endregion

            const data = e.data as unknown as T;
            const index = this._stack.indexOf(data);
            const hasInStack = index >= 0;

            // Если контейнер пересек или ушел за верхнюю границу, то добавляем его в стек закрепленных.
            // В противном случае выкидываем его из стека тем самым делая последний элемент стека актуальным.
            if (intersectTop || above) {
                // Пропускаем запись если она уже есть в стеке.
                // В зависимости от конфигурации threshold событие
                // пересечения может стрелять несколько раз
                if (hasInStack) {
                    return;
                }

                this._stack.push(data);
            } else if (hasInStack) {
                // Если запись нашлась в середине, то нужно также из стека выкинуть все что стоит после неё.
                // Т.к. при включенном виртуальном скроле и быстром скролировании элементы могут просто не
                // успеть отрисоваться и события о пересечении для них не будет.
                this._stack.splice(index, this._stack.length - index);
            }
        });

        return this.getPinnedData();
    }

    private getPinnedData(): T {
        return this._stack.length ? this._stack[this._stack.length - 1] : null;
    }
}

// Данное имя модуля зарегистрировано в UICommon
PinController.prototype._moduleName = 'Controls/stickyEnvironment:PinController';
