import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import * as Utils from 'Controls/_progress/Utils';

import stateBarTemplate = require('wml!Controls/_progress/StateBar/StateBar');
import 'css!Controls/progress';

/**
 * Интерфейс конфигурации сектора.
 * @interface Controls/progress:IStateBarSector
 * @public
 * @author Мочалов М.А.
 */
export interface IStateBarSector {

    /**
     * @name Controls/progress:IStateBarSector#value
     * @cfg {Number} Определяет размер от 0 до 100 (процентное значение) сектора индикатора.
     * @remark Сумма значений секторов не должна превышать 100.
     */
    value: number;

    /**
     * @name Controls/progress:IStateBarSector#style
     * @cfg {string} Определяет цвет сектора индикатора.
     * @remark Если цвет не указан, будет использован цвет по умолчанию - 'secondary'.
     * @variant primary
     * @variant success
     * @variant warning
     * @variant danger
     * @variant info
     * @default secondary
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
 * @author Мочалов М.А.
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
     * @variant readonly
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
     * @default left - Отображение cлева направо.
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
 * @author Мочалов М.А.
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
        if (opts.data !== this._options.data) {
            this._applyNewState(opts);
        }
    }

    /**
     * Проверяеит данные
     * @param opts {IStateBarOptions}
     * @private
     */
    private _applyNewState(opts: IStateBarOptions): void {
        let currSumValue = 0;
        const maxSumValue = 100;
        Utils.isSumInRange(opts.data, maxSumValue, 'StateBar');

        this._sectors = opts.data.map((sector) => {
            let value = Number(sector.value);
            if (!Utils.isNumeric(value)) {
                value = 0;
            }

            // Проверяем, выходит ли значение за допустимы пределы
            if (!Utils.isValueInRange(value)) {
                value = value > 0 ? Math.min(value, maxSumValue) : 0;
            }

            // Если при добавлениии очередного сектора, сумма секторов превышает ширину в 100%,
            // устанавливаем для сектора оставшуюся незадействованную ширину
            if (!Utils.isValueInRange(currSumValue + value)) {
                value = maxSumValue - currSumValue;
            }
            currSumValue += value;

            return {
                style: sector.style ? sector.style : 'secondary',
                title: sector.title ? sector.title : '',
                value
            };
        });
    }

    static getDefaultOptions(): object {
        return {
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
