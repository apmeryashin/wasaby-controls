import {Control as BaseControl} from 'UI/Base';
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import { SyntheticEvent } from 'Vdom/Vdom';
import EventProxy from './Mixin/EventProxy';
import {DateRangeModel, Utils as DateControlsUtils, dateRangeQuantum as quantumUtils} from 'Controls/dateRange';
import {EventUtils} from 'UI/Events';
import {MonthModel} from 'Controls/calendar';
import {Base as dateUtils} from 'Controls/dateUtils';
import datePopupUtils from './Utils';
import componentTmpl = require('wml!Controls/_datePopup/DateRange');
import * as monthHeaderTmpl from 'wml!Controls/_datePopup/DateRangeMonthHeaderTemplate';
import {detection} from 'Env/Env';

const _private = {
    updateView: function (self, options) {
        self._rangeModel.update(options);
        self._monthSelectionEnabled = !options.readOnly && (options.selectionType === 'range' ||
            (options.selectionType === 'quantum' && quantumUtils.monthSelectionEnabled(options.ranges) &&
                options.ranges.months[0] === 1));
        if (self._position !== options.position) {
            self._position = options.position;
        }
        if (!self._singleDayHover) {
            self._hoveredStartValue = options.hoveredStartValue;
            self._hoveredEndValue = options.hoveredEndValue;
        }
    },

    notifyPositionChanged: function(self, position) {
        self._notify('positionChanged', [position]);
    }
};
/**
 * Component that allows you to select periods of multiple days.
 *
 * @class Controls/_datePopup/DateRange
 * @extends UI/Base:Control
 *
 * @author Красильников А.С.
 * @private
 */
var Component = BaseControl.extend([EventProxy], {
    _template: componentTmpl,
    _monthHeaderTmpl: monthHeaderTmpl,

    _monthViewModel: MonthModel,

    _weekdaysCaptions: DateControlsUtils.getWeekdaysCaptions(),
    _formatDate: formatDate,

    _monthSelectionEnabled: true,
    _selectionProcessing: false,

    _singleDayHover: true,

    // We store the position locally in the component, and don't use the value from options
    // to be able to quickly switch it on the mouse wheel.

    constructor: function (options) {
        Component.superclass.constructor.apply(this, arguments);
        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        EventUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged']);
        // Нет необходимости передавать опцию hoveredStartValue и hoveredEndValue, если ховер работает только по одному
        // итему, а не по нескольким, как в квантах.
        const isQuantumSelection = options.selectionType === 'quantum' && options.ranges;
        if (isQuantumSelection) {
            const isSingleDayQuantum = 'days' in options.ranges && options.ranges.days.indexOf(1) !== -1;
            this._singleDayHover = isSingleDayQuantum;
        }
    },

    _beforeMount: function (options) {
        if (options.position) {
            this._monthsPosition = new Date(options.position.getFullYear(), 0);
            // При открытии календаря будут видны сразу 2 месяца. Поставим маркер на нижний видимый месяц, чтобы
            // избежать моргания маркера.
            const markedKeyDate = new Date(options.position.getFullYear(), options.position.getMonth() + 1);
            this._markedKey = this._dateToId(markedKeyDate);
        }
        _private.updateView(this, options);
    },

    _beforeUpdate: function (options) {
        _private.updateView(this, options);
    },

    _beforeUnmount: function () {
        this._rangeModel.destroy();
    },

    _monthCaptionClick: function(e: SyntheticEvent, yearDate: Date, month: number): void {
        let date;
        if (this._monthSelectionEnabled) {
            date = new this._options.dateConstructor(yearDate.getFullYear(), month);
            let startValue = date;
            let endValue = dateUtils.getEndOfMonth(date);
            if (this._options.rangeSelectedCallback) {
                const ranges = this._options.rangeSelectedCallback(startValue, endValue);
                startValue = ranges[0];
                endValue = ranges[1];
            }
            this._notify('fixedPeriodClick', [startValue, endValue]);
        }
    },

    _dateToId: function(date: Date): string {
        return formatDate(date, 'YYYY-MM-DD');
    },

    /**
     * [текст, условие, если true, если false]
     * @param prefix
     * @param style
     * @param cfgArr
     * @private
     */
    _prepareCssClass: function (prefix, style, cfgArr) {
        var cssClass = prefix;
        if (style) {
            cssClass += '-' + style;
        }
        return cfgArr.reduce(function (previousValue, currentValue, index) {
            var valueToAdd = currentValue[0] ? currentValue[1] : currentValue[2];
            if (valueToAdd) {
                return previousValue + '-' + valueToAdd;
            }
            return previousValue;
        }, cssClass);
    },

    _onItemClick: function (e) {
        e.stopPropagation();
    },

    _dateToString: function(date) {
        return datePopupUtils.dateToDataString(date);
    },

    _scrollToMonth: function(e, year, month) {
        // При клике на месяц позиционируем его снизу, по аналогии с работй маркера при инициализации
        _private.notifyPositionChanged(this, new this._options.dateConstructor(year, month - 1));
        e.stopPropagation();
    },

    _formatMonth: function(month) {
        return formatDate(new Date(2000, month), 'MMMM');
    },

    _getMonth: function(year, month) {
        return new this._options.dateConstructor(year, month, 1);
    },

    _onPositionChanged: function(e: Event, position: Date) {
        this._position = position;
        const markedKeyDate = new Date(position.getFullYear(), position.getMonth() + 1);
        this._markedKey = this._dateToId(markedKeyDate);
        if (markedKeyDate.getFullYear() !== this._monthsPosition.getFullYear()) {
            this._monthsPosition = new Date(markedKeyDate.getFullYear(), 0);
        }
        _private.notifyPositionChanged(this, position);
    },

    _onMonthsPositionChanged: function(e: Event, position: Date) {
        let positionChanged;
        let newPosition;
        // При скролле колонки с месяцами нужно менять позицию календаря только тогда,
        // когда мы увидим следующий год полностью.

        // Позицией у MonthList считается самый верхний видимый год.
        // Если мы скроллим вверх, то будем переключаться на год только тогда, когда позиция встанет на год выше.
        // Таким образом мы переключимся на год только тогда, когда он станет полностью видимым.
        if (position.getFullYear() + 2 === this._position.getFullYear()) {
            newPosition = new Date(position.getFullYear() + 1, 0);
            positionChanged = true;
        }
        // При скролле вниз, год станет полностью видимым одновременно с тем, как поменяется позиция. Меняем год сразу.
        if (position.getFullYear() - 1 === this._position.getFullYear()) {
            newPosition = new Date(position.getFullYear(), 0);
            positionChanged = true;
        }
        if (positionChanged) {
            this._markedKey = this._dateToId(newPosition);
            _private.notifyPositionChanged(this, newPosition);
        }
    },

    _preventEvent(event: Event): void {
        // Отключаем скролл ленты с месяцами, если свайпнули по колонке с месяцами
        // Для тач-устройств нельзя остановить событие скрола, которое стреляет с ScrollContainer,
        // внутри которого лежит 2 контейнера для которых требуется разное поведение на тач устройствах
        event.preventDefault();
        event.stopPropagation();
    }

});

Component._private = _private;
Component._theme = ['Controls/datePopup'];
// Component.EMPTY_CAPTIONS = IPeriodSimpleDialog.EMPTY_CAPTIONS;

Component.getDefaultOptions = function() {
   return {
       dateConstructor: WSDate
   };
};

// Component.getOptionTypes = function() {
//    return coreMerge({}, IPeriodSimpleDialog.getOptionTypes());
// };

export = Component;
