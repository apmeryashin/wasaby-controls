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
     * @cfg {any} Денные которые будут переданы в {@link Controls/stickyEnvironment:DataPinConsumer DataPinConsumer}
     * при уходе текущего {@link Controls/stickyEnvironment:DataPinContainer DataPinContainer} за верхнюю границу
     * {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController})
     */
    data?: unknown;

    /**
     * @cfg {String} Отступ от верхней границы {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController})
     * при котором будет засчитано пересечение. Представляет собой строку с синтаксисом, аналогичным синтаксису свойства
     * CSS margin-top.
     *
     * @remark
     * Если пересечение должно быть засчитано раньше чем начинается верхняя граница, то значение должно быть отрицательным.
     *
     * @default '0px'
     */
    topMargin?: string;
}

/**
 * Контрол контейнер на котором можно закрепить произвольные данные и который отслеживает свое положение внутри
 * {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController}).В случае ухода
 * данного контейнера за верхнюю границу <i>ScrollContainer</i> его данные будут переданы в {@link Controls/stickyEnvironment:DataPinConsumer DataPinConsumer}
 * в рамках родительского {@link Controls/stickyEnvironment:DataPinProvider DataPinProvider}.
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export class DataPinContainer<T = unknown> extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    // значения пересечения при которых дергается _intersectHandler
    // при такой конфигурации событие будет стрелять трижды:
    //  1. при пересечении блок с верхней границей контейнера
    //  2. при уходе блока за верхнюю границу контейнера
    //  3. при полном выходе блока ниже верхней границы контейнера
    protected _threshold: number[] = [0, 1];

    // Отступы от корневого IntersectionObserverController при которых будет засчитано пересечение
    protected _rootMargin: string = '0px 0px 0px 0px';

    private pinController: PinController;

    protected _intersectHandler(
        event: SyntheticEvent,
        entries: IntersectionObserverSyntheticEntry
    ): void {
        this.pinController.processIntersect(entries);
    }

    protected _beforeMount(options: IDataPinContainer, context: IPinConsumerContext): void {
        this.pinController = context.pinController;
        this._updateRootMargin(options.topMargin);
    }

    protected _beforeUpdate(newOptions: IDataPinContainer): void {
        // tslint:disable-next-line:ban-ts-ignore
        // @ts-ignore - не видит this._options
        if (this._options.topMargin !== newOptions.topMargin) {
            this._updateRootMargin(newOptions.topMargin);
        }
    }

    private _updateRootMargin(top: string = '0px'): void {
        this._rootMargin = `${top} 0px 0px 0px`;
    }

    static contextTypes(): object {
        return {
            pinController: PinController
        };
    }
}
