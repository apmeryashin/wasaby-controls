import rk = require('i18n!Controls');
import {date as formatDate} from 'Types/formatter';
import {Logger} from 'UI/Utils';

interface IArgs {
    value: Date;
    minValue?: Date;
    maxValue?: Date;
}

/**
 * Функция проверяет, попадает ли дата в заданные диапазон.
 * @class Controls/_validate/Validators/inRange
 * @public
 * @author Красильников А.С.
 * @remark
 * Подробнее о работе с валидацией читайте {@link /doc/platform/developmentapl/interface-development/forms-and-validation/validation/ здесь}.
 *
 * Аргументы функции:
 *
 * * value — проверяемое значение.
 * * minValue - минимальное допустимое значение
 * * maxValue - максимальное допустимое значение
 *
 * Типы возвращаемых значений:
 *
 * * true — значение прошло проверку на валидность.
 * * String — значение не прошло проверку на валидность, возвращается текст сообщения об ошибке.
 *
 * @example
 * <pre>
 * <Controls.dateRange:Input>
 *     <ws:startValueValidators>
 *         <ws:Array>
 *             <ws:Function value="{{ _startValue }} minValue="{{ _minValue }}" maxValue="{{ _maxValue }}">Controls/validate:inRange</ws:Function>
 *         </ws:Array>
 *     </ws:startValueValidators>
 *     <ws:endValueValidators>
 *         <ws:Array>
 *             <ws:Function value="{{ _endValue }} minValue="{{ _minValue }}" maxValue="{{ _maxValue }}">Controls/validate:inRange</ws:Function>
 *         </ws:Array>
 *     </ws:endValueValidators>
 * </Controls.dateRange:Input>
 * </pre>
 * </pre>
 *  this._minValue = new Date(2015, 0);
 *  this._maxValue = new Date(2030, 0);
 * </pre>
 */

export default function(args: IArgs): boolean | string {
    if (args.minValue && args.maxValue && args.maxValue < args.minValue) {
        Logger.error('Controls.validate:inRange: maxValue не может быть меньше чем minValue');
    }

    if (!args.value || !(args.minValue || args.maxValue) ||
        (args.value >= args.minValue && args.value <= args.maxValue)) {
        return true;
    }
    const errorText = rk('Значение должно попадать в диапазон');
    if (!args.maxValue) {
        return `${errorText} ${rk('с')} ${formatDate(args.minValue, formatDate.FULL_DATE)}`;
    } else if (!args.minValue) {
        return `${errorText} ${rk('по', 'Period')} ${formatDate(args.maxValue, formatDate.FULL_DATE)}`;
    }
    return `${errorText}: ${formatDate(args.minValue, formatDate.FULL_DATE)} - ${formatDate(args.maxValue, formatDate.FULL_DATE)}`;
}
