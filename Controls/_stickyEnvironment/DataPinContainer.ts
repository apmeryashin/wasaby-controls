import {SyntheticEvent} from 'Vdom/Vdom';
import {IPinConsumerContext} from './DataPinProvider';
import {IntersectionObserverSyntheticEntry} from 'Controls/scroll';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {PinController} from 'Controls/_stickyEnvironment/PinController';
import * as template from 'wml!Controls/_stickyEnvironment/DataPinContainer';

/**
 * Интерфейс описывает структуру конфигурации контрола {@link Controls/stickyEnvironment:DataPinContainer DataPinContainer}
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IDataPinContainer extends IControlOptions {
    /**
     * @cfg {any} Данные которые будут переданы в {@link Controls/stickyEnvironment:DataPinConsumer DataPinConsumer} при уходе текущего {@link Controls/stickyEnvironment:DataPinContainer DataPinContainer} за верхнюю границу {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController})
     */
    data?: unknown;

    /**
     * @cfg {String} Отступ от верхней границы {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController}) при котором будет засчитано пересечение. Представляет собой строку с синтаксисом, аналогичным синтаксису свойства CSS margin-top.
     *
     * @remark
     * Если пересечение должно быть засчитано раньше чем начинается верхняя граница, то значение должно быть отрицательным.
     *
     * @default '0px'
     */
    topMargin?: string;

    /**
     * @cfg {String} Отступ от нижней границы {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController}) при котором будет засчитано пересечение. Представляет собой строку с синтаксисом, аналогичным синтаксису свойства CSS margin-top.
     *
     * @default '0px'
     */
    bottomMargin?: string;
}

/**
 * Контрол контейнер на котором можно закрепить произвольные данные и который отслеживает свое положение внутри {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController}).
 * В случае ухода данного контейнера за верхнюю границу <i>ScrollContainer</i> его данные будут переданы в {@link Controls/stickyEnvironment:DataPinConsumer DataPinConsumer} в рамках родительского {@link Controls/stickyEnvironment:DataPinProvider DataPinProvider}.
 *
 * <strong>Важно</strong>
 * {@link Controls/stickyEnvironment:DataPinContainer DataPinContainer} не должен лежать внутри элемента с <i>overflow: hidden</i>. Иначе это на нативном уровне ломает функционал IntersectionObserver.
 * Единственный предок с <i>overflow: hidden</i> должен быть только {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController})
 *
 * @demo Controls-demo/StickyEnvironment/DataPinProvider/Base/Index
 * @demo Controls-demo/StickyEnvironment/DataPinProvider/Grid/Index
 * @demo Controls-demo/StickyEnvironment/DataPinProvider/Events/Index
 *
 * @implements Controls/stickyEnvironment:IDataPinContainer
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export class DataPinContainer extends Control<IDataPinContainer> {
    protected _options: IDataPinContainer;
    protected _template: TemplateFunction = template;

    // значения пересечения при которых дергается _intersectHandler
    // при такой конфигурации событие будет стрелять трижды:
    //  1. при пересечении блока с верхней границей контейнера
    //  2. при полном уходе блока за верхнюю границу контейнера
    //  3. при полном выходе блока ниже верхней границы контейнера
    protected _threshold: number[] = [0, 1];

    // Отступы от корневого IntersectionObserverController при которых будет засчитано пересечение
    protected _rootMargin: string = '0px 0px 0px 0px';

    private pinController: PinController;

    //region life circle hooks
    protected _beforeMount(options: IDataPinContainer, context: IPinConsumerContext): void {
        this.pinController = context.pinController;
        this._updateRootMargin(options.topMargin, options.bottomMargin);
    }

    protected _beforeUpdate(newOptions: IDataPinContainer): void {
        if (
            this._options.topMargin !== newOptions.topMargin ||
            this._options.bottomMargin !== newOptions.bottomMargin
        ) {
            this._updateRootMargin(newOptions.topMargin, newOptions.bottomMargin);
        }
    }

    protected _beforeUnmount(): void {
        // При дестрое надо выкинуть наши данные из стека PinController'а
        this.pinController.dropStackItem(this._options.data);
    }
    //endregion

    /**
     * Обработчик появления/скрытия в области видимости родительского IntersectionObserverController.
     */
    protected _intersectHandler(
        event: SyntheticEvent,
        entry: IntersectionObserverSyntheticEntry
    ): void {
        this.pinController.processIntersect(entry);
    }

    private _updateRootMargin(top: string = '0px', bottom: string = '0px'): void {
        this._rootMargin = `${top} 0px ${bottom} 0px`;
    }

    static contextTypes(): object {
        return {
            pinController: PinController
        };
    }
}
