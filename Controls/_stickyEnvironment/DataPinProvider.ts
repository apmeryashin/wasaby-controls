import {PinController} from './PinController';
import {IEdgesData} from 'Controls/_stickyEnvironment/interfaces';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_stickyEnvironment/DataPinProvider';

/**
 * Структуру объекта контекста, которая используется для передачи {@link PinController}
 * в DataPinContainer и DataPinConsumer
 */
export interface IPinConsumerContext<T = unknown> {
    pinController: PinController<T>;
}

/**
 * Контрол, организующий связь между {@link Controls/stickyEnvironment:DataPinContainer DataPinContainer} и {@link Controls/stickyEnvironment:DataPinConsumer DataPinConsumer}.
 *
 * Задача данного контрола - отслеживать и уведомлять пользователей об обновление граничных данных относительно верхней и нижней границы {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController})
 * Уведомление пользователей происходит путём генерации события ${@link Controls/stickyEnvironment:DataPinProvider#edgesDataChanged edgesDataChanged}
 *
 * @demo Controls-demo/StickyEnvironment/DataPinProvider/Base/Index
 * @demo Controls-demo/StickyEnvironment/DataPinProvider/Grid/Index
 * @demo Controls-demo/StickyEnvironment/DataPinProvider/Events/Index
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export class DataPinProvider<T = unknown> extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _pinController: PinController<T>;

    protected _beforeMount(): void {
        // Создаем контроллер, который будет обрабатывать появление/скрытие
        // целевых элементов в области видимости
        this._pinController = new PinController<T>({
            onEdgesDataChanged: this._onEdgesDataChanged.bind(this)
        });
    }

    private _onEdgesDataChanged(intersectInfo: IEdgesData<T>): void {
        this._notify('edgesDataChanged', [intersectInfo]);
    }

    /**
     * Временный метод для очистики стека закрепленных итемов.
     * Понадобился как быстрое решение вот этой проблемы
     * https://online.sbis.ru/opendoc.html?guid=a17584db-5cc5-429f-b975-c18dbc52e601
     */
    clearStack(): void {
        this._pinController.clearStack();
    }

    _getChildContext(): IPinConsumerContext {
        return {
            pinController: this._pinController
        };
    }
}

/**
 * @event edgesDataChanged Происходи при обновлении граничных данных относительно верхней и нижней границы родительского {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController})
 * @name Controls/stickyEnvironment:DataPinProvider#edgesDataChanged
 */
