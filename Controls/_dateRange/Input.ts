import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {IDateRangeValidators, IDateRangeValidatorsOptions} from 'Controls/interface';
import {EventUtils} from 'UI/Events';
import DateRangeModel from './DateRangeModel';
import {Range, Popup as PopupUtil} from 'Controls/dateUtils';
import {StringValueConverter, IDateTimeMask, ISelection} from 'Controls/input';
import template = require('wml!Controls/_dateRange/Input/Input');
import {DependencyTimer} from 'Controls/popup';
import {Logger} from 'UI/Utils';

interface IDateRangeInputOptions extends IDateRangeValidatorsOptions {
}

/**
 * Поле ввода периода дат.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FdateRange%2FInput%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/date-time/date/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less переменные тем оформления}
 * @class Controls/_dateRange/Input
 * @extends UI/Base:Control
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IRangeInputTag
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_interface/IDateMask
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_interface/IDateRangeValidators
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 *
 * @public
 * @demo Controls-demo/dateRange/Input/Default/Index
 * @author Красильников А.С.
 */

/*
 * Control for entering date range.
 * @class Controls/_dateRange/Input
 * @extends UI/Base:Control
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IRangeInputTag
 * @mixes Controls/_interface/IDateMask
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 *
 *
 * @public
 * @demo Controls-demo/dateRange/Input/Default/Index
 * @author Красильников А.С.
 */
export default class DateRangeInput extends Control<IDateRangeInputOptions> implements
        IDateRangeValidators {
    readonly '[Controls/_interface/IDateRangeValidators]': boolean = true;

    protected _template: TemplateFunction = template;
    protected _proxyEvent: Function = EventUtils.tmplNotify;

    private _dependenciesTimer: DependencyTimer = null;
    private _loadCalendarPopupPromise: Promise<unknown> = null;

    protected _rangeModel;

    protected _startValueValidators: Function[] = [];
    protected _endValueValidators: Function[] = [];
    private _shouldValidate: boolean;
    private _state: string;

    protected _beforeMount(options: IDateRangeInputOptions) {
        this._rangeModel = new DateRangeModel({dateConstructor: this._options.dateConstructor});
        this._rangeModel.update(options);
        EventUtils.proxyModelEvents(
            this, this._rangeModel,
            ['startValueChanged', 'endValueChanged', 'rangeChanged']
        );
        this._rangeModel.subscribe('rangeChanged', this._updateValidators.bind(this));
        this._updateValidators(options);
        this._stateChangedCallback = this._stateChangedCallback.bind(this);
    }

    protected _beforeUpdate(options: IDateRangeInputOptions) {
        if (this._options.startValue !== options.startValue ||
            this._options.endValue !== options.endValue) {
            this._rangeModel.update(options);
        }
        if (this._options.startValueValidators !== options.startValueValidators ||
                this._options.startValue !== options.startValue) {
            this._updateStartValueValidators(options.startValueValidators);
        }
        if (this._options.endValueValidators !== options.endValueValidators ||
                this._options.endValue !== options.endValue) {
            this._updateEndValueValidators(options.endValueValidators);
        }
    }

    protected _beforeUnmount() {
        this._rangeModel.destroy();
    }

    openPopup(event: SyntheticEvent): void {
        var cfg = {
            ...PopupUtil.getCommonOptions(this),
            target: this._container,
            template: 'Controls/datePopup',
            className: 'controls-PeriodDialog__picker_theme-' + this._options.theme,
            templateOptions: {
                ...PopupUtil.getDateRangeTemplateOptions(this),
                _date: this._options._date,
                selectionType: this._options.selectionType,
                calendarSource: this._options.calendarSource,
                rightFieldTemplate: this._options.rightFieldTemplate,
                dayTemplate: this._options.dayTemplate,
                ranges: this._options.ranges,
                headerType: 'input',
                closeButtonEnabled: true,
                rangeselect: true,
                range: this._options.range,
                state: this._state,
                stateChangedCallback: this._stateChangedCallback
            }
        };
        this._children.opener.open(cfg);
    }

    protected _mouseEnterHandler(): void {
        if (!this._dependenciesTimer) {
            this._dependenciesTimer = new DependencyTimer();
        }
        this._dependenciesTimer.start(this._loadDependencies);
    }

    protected _mouseLeaveHandler(): void {
        this._dependenciesTimer?.stop();
    }

    protected _stateChangedCallback(state: string): void {
        this._state = state;
    }

    private _loadDependencies(): Promise<unknown> {
        try {
            if (!this._loadCalendarPopupPromise) {
                this._loadCalendarPopupPromise = import('Controls/datePopup')
                    .then((datePopup) => datePopup.default.loadCSS());
            }
            return this._loadCalendarPopupPromise;
        } catch (e) {
            Logger.error('shortDatePicker:', e);
        }
    }

    private _onResultWS3(event: SyntheticEvent, startValue: Date, endValue: Date): void {
        this._onResult(startValue, endValue);
    }

    protected _afterUpdate(options): void {
        if (this._shouldValidate) {
            this._shouldValidate = false;
            this._children.startValueField.validate();
            this._children.endValueField.validate();
        }
    }

    private _onResult(startValue: Date, endValue: Date): void {
        this._rangeModel.setRange(startValue, endValue);
        this._children.opener?.close();
        this._notifyInputCompleted();
        /**
         * Вызываем валидацию, т.к. при выборе периода из календаря не вызывается событие valueChanged
         * Валидация срабатывает раньше, чем значение меняется, поэтому откладываем ее до _afterUpdate
         */
        this._shouldValidate = true;
    }

    protected _startFieldInputControlHandler(event: SyntheticEvent, value: unknown, displayValue: string, selection: ISelection): void {
        if (selection.end === displayValue.length) {
            this._children.endValueField.activate({enableScreenKeyboard: true});
        }
        // После смены значения в поле ввода сбрасывается результат валидации.
        // Проблема в том, что результат валидации не сбрасывается в другом поле. Из-за этого появляется инфобокс при
        // наведении https://online.sbis.ru/opendoc.html?guid=42046d94-7a30-491a-b8b6-1ce710bddbaa
        // Будем обнавлять другое поле сами.
        // Если устанолвена опция validateByFocusOut true, будем валидировать поле на afterMount, когда значение
        // поменяется. Если validateByFocusOut false, то просто сбросим результат валидации.
        if (this._options.validateByFocusOut && this._rangeModel.endValue !== null) {
            this._shouldValidate = true;
        } else {
            this._children.endValueField.setValidationResult(null);
        }
    }

    protected _endFieldInputControlHandler(): void {
        if (this._options.validateByFocusOut && this._rangeModel.startValue !== null) {
            this._shouldValidate = true;
        } else {
            this._children.startValueField.setValidationResult(null);
        }
    }

    protected _notifyInputCompleted(): void {
        const converter = new StringValueConverter({
            mask: this._options.mask,
            replacer: this._options.replacer,
            dateConstructor: this._options.dateConstructor
        });
        this._notify('inputCompleted', [
            this._rangeModel.startValue,
            this._rangeModel.endValue,
            converter.getStringByValue(this._rangeModel.startValue),
            converter.getStringByValue(this._rangeModel.endValue)
        ]);
    }

    private _updateValidators(options?: IDateRangeInputOptions): void {
        this._updateStartValueValidators(options?.startValueValidators);
        this._updateEndValueValidators(options?.endValueValidators);
    }

    private _updateStartValueValidators(validators?: Function[]): void {
        const startValueValidators: Function[] = validators || this._options.startValueValidators;
        this._startValueValidators = Range.getRangeValueValidators(startValueValidators, this._rangeModel, this._rangeModel.startValue);
    }

    private _updateEndValueValidators(validators?: Function[]): void {
        const endValueValidators: Function[] = validators || this._options.endValueValidators;
        this._endValueValidators = Range.getRangeValueValidators(endValueValidators, this._rangeModel, this._rangeModel.endValue);
    }

    static _theme: string[] = ['Controls/dateRange', 'Controls/Classes'];

    static getDefaultOptions(): Partial<IDateRangeInputOptions> {
        return {
            ...IDateTimeMask.getDefaultOptions(),
            startValueValidators: [],
            endValueValidators: [],
            validateByFocusOut: true,
            startValue: null,
            endValue: null
        };
    }

    static getOptionTypes(): Partial<Record<keyof IDateRangeInputOptions, Function>> {
        return {
            ...IDateTimeMask.getOptionTypes()
        };
    }
}
