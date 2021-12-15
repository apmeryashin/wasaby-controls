import {PinController} from './PinController';
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
 * Задача данного контрола - отследить когда <i>DataPinContainer</i> уходит за верхнюю границу {@link Controls/scroll:Container}
 * (либо {@link Controls/scroll:IntersectionObserverController}) и прокинуть его данные в {@link Controls/stickyEnvironment:DataPinConsumer DataPinConsumer}.
 * При этом если несколько <i>DataPinContainer</i> будут находиться за верхней границей {@link Controls/scroll:Container},
 * то в <i>DataPinConsumer</i> будут переданы данные ближайшего <i>DataPinContainer</i>.
 *
 * @demo Controls-demo/StickyEnvironment/DataPinProvider/Base
 * @demo Controls-demo/StickyEnvironment/DataPinProvider/Grid
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export class DataPinProvider<T = unknown> extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _pinController: PinController<T>;

    protected _beforeMount(): void {
        this._pinController = new PinController<T>();
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
