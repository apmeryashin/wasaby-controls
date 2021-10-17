import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {isEqual} from 'Types/object';

import stateBarTemplate = require('wml!Controls/_progress/StateBar/StateBar');
import 'css!Controls/progress';

/**
 * Интерфейс конфигурации сектора.
 * @interface Controls/progress:IStateBarSector
 * @public
 * @author Сорокин Д.А.
 */
export interface IStateBarSector {

    /**
     * @name Controls/progress:IStateBarSector#value
     * @cfg {Number} Определяет размер от 0 до 100 (процентное значение) сектора индикатора.
     * @remark Сумма значений секторов не должна превышать 100.
     * @default 0
     */
    value: number;

    /**
     * @name Controls/progress:IStateBarSector#style
     * @cfg {string} Определяет цвет сектора индикатора.
     * @remark Если цвет не указан, будет использован цвет по умолчанию - 'secondary'.
     * @default 'secondary'
     */
    style?: string;

    /**
     * @name Controls/progress:IStateBarSector#title
     * @cfg {string} Название сектора.
     * @default ''
     */
    title?: string;
}

/**
 * Интерфейс опций для {@link Controls/progress:StateBar}.
 * @interface Controls/progress:IStateBar
 * @public
 * @author Сорокин Д.А.
 */
export interface IStateBarOptions extends IControlOptions {

    /**
     * @name Controls/progress:IStateBarOptions#data
     * @cfg {Array.<Controls/progress:IStateBarSector>} Массив цветных секторов индикатора.
     * @example
     * <pre class="brush: html">
     * <!-- WML -->
     * <Controls.progress:StateBar data="{{[{value: 10, style: 'success', title: 'Выполнено'}]}}"/>
     * </pre>
     * @remark
     * Количество элементов массива задает количество секторов индикатора.
     * @demo Controls-demo/progress/StateBar/Base/Index
     */
    data: IStateBarSector[];

    /**
     * @name Controls/progress:IStateBar#blankAreaStyle
     * @cfg {String} Определяет цвет незаполненной области индикатора.
     * @variant primary
     * @variant success
     * @variant warning
     * @variant danger
     * @variant secondary
     * @variant info
     * @default none - Заливка отсутствует.
     * @example
     * <pre class="brush:html">
     * <!-- WML -->
     * <Controls.progress:StateBar blankAreaStyle="success"/>
     * </pre>
     * @demo Controls-demo/progress/StateBar/BlankAreaStyle/Index
     */
    blankAreaStyle?: string;

    /**
     * @name Controls/progress:IStateBar#align
     * @cfg {String} Направление отображения прогресса слева направо или справа налево.
     * @variant right - Отображение справа налево.
     * @example
     * <pre class="brush:html">
     * <!-- WML -->
     * <Controls.progress:StateBar align="right"/>
     * </pre>
     * @demo Controls-demo/progress/StateBar/Align/Index
     */
    align?: string;
}

/**
 * Многоцветный индикатор выполнения.
 * Контрол визуального отображения прогресса выполнения процесса по нескольким показателям.
 *
 * @remark
 * Полезные ссылки:
 * {@link /materials/Controls-demo/app/Controls-demo%2fprogress%2fStateBar%2fIndex демо-пример}
 *
 * @extends UI/Base:Control
 * @implements Controls/progress:IStateBarOptions
 * @author Сорокин Д.А.
 *
 * @public
 * @demo Controls-demo/progress/StateBar/Index
 */
class StateBar extends Control<IStateBarOptions> {
    protected _template: TemplateFunction = stateBarTemplate;
    protected _sectors: IStateBarSector[];

    protected _beforeMount(opts: IStateBarOptions): void {
        this._applyNewState(opts);
    }

    protected _beforeUpdate(opts: IStateBarOptions): void {
        if (!isEqual(opts.data, this._options.data)) {
            this._applyNewState(opts);
        }
    }

    /**
     * Проверяеит и подготавливает данные
     * @param opts {IStateBarOptions}
     * @private
     */
    private _applyNewState(opts: IStateBarOptions): void {
        let currSumValue = 0;
        const maxPercentValue = 100;
        this._sectors = opts.data.map((sector) => {
            // Приводим значение к числу
            let value = Number(sector.value);
            if (isNaN(value)) {
                value = 0;
                Logger.error('StateBar: Sector value type is incorrect', this);
            }

            // Проверяем, выходит ли значение за допустимы пределы
            if (value < 0 || value > maxPercentValue) {
                Logger.error('StateBar: Sector value must be in range of [0..100]', this);
            }
            value = value > 0 ? Math.min(value, maxPercentValue) : 0;

            // Если при добавлениии очередного сектора, сумма секторов превышает ширину в 100%,
            // устанавливаем для сектора оставшуюся незадействованную ширину
            if (currSumValue + value > maxPercentValue) {
                value = maxPercentValue - currSumValue;
                Logger.error('StateBar', 'Data is incorrect. Values total is greater than 100%', this);
            }

            currSumValue += value;

            return {
                style: sector.style ? sector.style: 'secondary',
                title: sector.title ? sector.title : '',
                value
            }
        });
    }

    static getDefaultOptions(): object {
        return {
            theme: 'default',
            data: [{value: 0}]
        };
    }

    static getOptionTypes(): object {
        return {
            data: EntityDescriptor(Array).required(),
            blankAreaStyle: EntityDescriptor(String),
            align: EntityDescriptor(String)
        };
    }
}

Object.defineProperty(StateBar, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return StateBar.getDefaultOptions();
    }
});

export default StateBar;
