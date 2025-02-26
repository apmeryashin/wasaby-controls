import Base from 'Controls/_input/Base';

import {descriptor, TimeInterval} from 'Types/entity';
import {IOptions as IModelOptions, ViewModel} from 'Controls/_input/TimeInterval/ViewModel';

type IOptions = IModelOptions;

/**
 * Поле ввода временного интервала.
 * @remark
 * Позволяет вводить время с точностью от суток до секунд.
 *
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FExample%2FInput демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/input/date/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_input.less переменные тем оформления}
 *
 * @class Controls/_input/TimeInterval
 * @extends Controls/_input/Base
 * @mixes Controls/input:ITimeInterval
 *
 * @ignoreoptions Controls/input:Base#value
 * @ignoreoptions Controls/input:Base#placeholder
 *
 * @public
 * @demo Controls-demo/Input/TimeInterval/Base/Index
 *
 * @author Мочалов М.А.
 */
// TODO: https://online.sbis.ru/doc/f654ff87-5fa9-4c80-a16e-fee7f1d89d0f

/* @name Controls/_input/TimeInterval#shouldNotRemoveStartZeros
 * @cfg {Boolean} Определяет, будут ли обрезаться лидирующие нули в поле ввода.
 * @ignore
 */

class TimeInterval extends Base {
    protected _autoWidth: boolean = true;
    protected _controlName: string = 'TimeInterval';

    protected _defaultValue: TimeInterval | null = null;

    protected _getViewModelOptions(options: IOptions): IModelOptions {
        return {
            mask: options.mask,
            shouldNotRemoveStartZeros: options.shouldNotRemoveStartZeros
        };
    }

    protected _getViewModelConstructor() {
        return ViewModel;
    }

    protected _notifyInputCompleted() {
        if (this._viewModel.autoComplete()) {
            this._notifyValueChanged();
        }

        super._notifyInputCompleted();
    }

    protected _focusInHandler(...args) {
        const isTab: boolean = !this._focusByMouseDown;

        /**
         * По стандарту "При получение фокуса по Tab в заполненном поле для ввода даты или времени курсор устанавливается
         * перед первым символом, если поле не заполнено полностью, то после последнего введенного символа.". Контрол всегда
         * либо не заполнен, либо заполнен. Потому что по уходу фокуса пустые места заполняются нулями. Получается при фокусе
         * по tab курсор должен стоять в начале.
         */
        if (isTab) {
            const selection = {
                start: 0,
                end: 0
            };
            this._viewModel.selection = selection;
            this._updateSelection(selection);
        }

        super._focusInHandler.apply(this, args);
    }

    static getDefaultOptions(): object {
        const defaultOptions = Base.getDefaultOptions();
        defaultOptions.spellCheck = false;

        return defaultOptions;
    }

    static getOptionTypes(): object {
        const optionTypes = Base.getOptionTypes();

        optionTypes.value = descriptor(Object, null);
        optionTypes.mask = descriptor(String).oneOf([
            'MM:SS',
            'HH:MM',
            'HHH:MM',
            'HHHH:MM',
            'HH:MM:SS',
            'HHH:MM:SS',
            'HHHH:MM:SS'
        ]).required();

        return optionTypes;
    }
}

Object.defineProperty(TimeInterval, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return TimeInterval.getDefaultOptions();
   }
});

export default TimeInterval;

/**
 * @name Controls/_input/TimeInterval#inputCompleted
 * @event Происходит при завершении ввода. Завершение ввода — это контрол потерял фокус, или пользователь нажал клавишу "Enter".
 * @param {Types/entity:applied.TimeInterval} value Значение контрола ввода.
 * @param {String} displayValue Отображаемое значение контрола ввода.
 * @remark
 * Событие используется в качестве реакции на завершение ввода пользователем. Например, проверка на валидность введенных данных или отправка данных в другой контрол.
 * @example
 * Подписываемся на событие inputCompleted и сохраняем значение поля в базе данных.
 * <pre class="brush: html">
 * <Controls.input:TimeInterval on:inputCompleted="_inputCompletedHandler()"/>
 * </pre>
 * <pre class="brush: js">
 * export class Form extends Control<IControlOptions, void> {
 *    ...
 *    private _inputCompletedHandler(event, value) {
 *        this._saveEnteredValueToDatabase(value);
 *    }
 *    ...
 * }
 * </pre>
 * @see value
 * @see valueChanged
 */
