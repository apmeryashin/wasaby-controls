import * as DataContext from 'Core/DataContext';
import {IntersectionObserverSyntheticEntry} from 'Controls/scroll';
import {IEdgesData} from 'Controls/_stickyEnvironment/interfaces';

type CallbackType<T> = (pinnedData: T) => void;

interface IStackItem<T = unknown> {
    data: T;
    element: HTMLElement;
}

interface IPinControllerCfg<T = unknown> {
    /**
     * Обработчик, который вызывается при обновлении пограничных данных относительно
     * верхней и/или нижней границ корневого элемента.
     */
    onEdgesDataChanged?: (data: IEdgesData<T>) => void;
}

/**
 * Внутренний контроллер, через который организуется связь между DataPinContainer и DataPinConsumer.
 * DataPinContainer уведомляет о пересечении с верхней границей, контроллер обрабатывает эту информацию
 * и уведомляет DataPinConsumer о новых данных.
 */
export class PinController<T = unknown> extends DataContext {

    _moduleName: string;

    private _stack: Array<IStackItem<T>> = [];

    // Обработчики, которые должны быть вызваны
    // при смене верхних граничных данных
    private _callbacks: Array<CallbackType<T>> = [];

    constructor(private _cfg: IPinControllerCfg<T>) {
        super();
    }

    subscribe(callback: CallbackType<T>): void {
        this._callbacks.push(callback);
    }

    /**
     * Выкидывает переданные данные из стека если они там есть.
     */
    dropStackItem(data: T): void {
        const index = this._stack.findIndex((item) => item.data === data);

        if (index >= 0) {
            this._stack.splice(index, 1);
        }
    }

    /**
     * Обработчик появления/скрытия целевых элементов в области видимости корневого элемента.
     * 1. Обновляет внутренний стек данных в соответствии с тем порядком в котором они идут в разметке.
     * 2. Обновляет информация о пограничных данных для верхней и нижней границ
     */
    processIntersect(entry: IntersectionObserverSyntheticEntry): void {
        // Если данных нет, то и обрабатывать нечего. Это какой-то левый элемент.
        if (!entry.data) {
            return;
        }

        // 1. Обновим стек данных
        this.updateStack(entry);
        // 2. Пересчитаем пограничные данные для верхней и нижней границ
        const edgesData = this.getEdgesData(entry.nativeEntry.rootBounds);

        this._callbacks.forEach((callback) => {
            callback(edgesData.top.above);
        });

        if (this._cfg.onEdgesDataChanged) {
            this._cfg.onEdgesDataChanged(edgesData);
        }
    }

    /**
     * Обновляет стек элементов с которыми отслеживается пересечение.
     * На основании верхнего смещения элемента вставляет его в соответсвующее место стека.
     */
    private updateStack(entry: IntersectionObserverSyntheticEntry): void {
        const data = entry.data as unknown as T;
        // getBoundingClientRect для элемента списка, который пересек границы ScrollContainer
        const targetBounds = entry.nativeEntry.boundingClientRect;
        const index = this._stack.findIndex((item) => item.data === data);

        // Пропускаем запись если она уже есть в стеке.
        if (index >= 0) {
            return;
        }

        let targetIndex;
        const element = entry.nativeEntry.target as HTMLElement;

        // Пробегаемся по стеку и ищем первый элемент верхняя границы которого выше
        // верхней границы текущего элемента, пересечение которого обрабатываем
        for (targetIndex = 0; targetIndex < this._stack.length; targetIndex++) {
            if (this._stack[targetIndex].element.getBoundingClientRect().top > targetBounds.top) {
                break;
            }
        }

        this._stack.splice(targetIndex, 0, {data, element});
    }

    /**
     * На основании текущих данных стека вычисляет какие из них находятся ближе всего
     * к верхней и нижней границе корневого элемента.
     */
    private getEdgesData(rootBounds: DOMRectReadOnly): IEdgesData<T> {
        let aboveTop: T;
        let bellowTop: T;
        let aboveBottom: T;
        let belowBottom: T;

        for (let i = 0; i < this._stack.length; i++) {
            const stackItem = this._stack[i];
            const targetBounds = stackItem.element.getBoundingClientRect();

            if (targetBounds.top < rootBounds.top) {
                aboveTop = stackItem.data;
            }

            if (!bellowTop && targetBounds.top >= rootBounds.top) {
                bellowTop = stackItem.data;
            }

            if (targetBounds.top < rootBounds.bottom) {
                aboveBottom = stackItem.data;
            }

            if (!belowBottom && targetBounds.top >= rootBounds.bottom) {
                belowBottom = stackItem.data;
                break;
            }
        }

        return {
            top: {
                above: aboveTop,
                below: bellowTop
            },
            bottom: {
                above: aboveBottom,
                below: belowBottom
            }
        };
    }
}

// Данное имя модуля зарегистрировано в UICommon
PinController.prototype._moduleName = 'Controls/stickyEnvironment:PinController';
