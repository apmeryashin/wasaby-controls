import getPeriodType = require('Core/helpers/Date/getPeriodType');
import getPeriodLengthInMonthByType = require('Core/helpers/Date/getPeriodLengthInMonthByType');
import periodTypes = require('Core/helpers/Date/periodTypes');
import {Range, Base as dateUtils} from 'Controls/dateUtils';
import {IDateConstructorOptions} from 'Controls/interface';

const enum SLIDE_DATE_TYPE {
    days,
    months,
    years
}

type TRange = [Date | null, Date | null];

export interface IModel extends IDateConstructorOptions {
    bindType: string;
}

class ModuleClass {
    ranges: TRange[];
    private _steps: number[];
    private _relationMode: string;
    private _dateConstructor: Function;

    constructor(options: IModel) {
        this.update(options);
    }

    /**
     * Updates model fields.
     * @param options
     */
    update(options: IModel): void {
        this.ranges = this._getRangesFromOptions(options);
        this._updateSteps(this.ranges);
        this._relationMode = options.bindType;
        this._dateConstructor = options.dateConstructor;
    }

    updateRanges(start: Date, end: Date, changedRangeIndex: number, relationMode: string): void {
        if (this._rangeIsNotEmpty([start, end])) {
            let oldRelationMode;
            let newRanges;

            if (relationMode) {
                oldRelationMode = relationMode;
                this._relationMode = relationMode;
            } else {
                oldRelationMode = this._relationMode;
                this._autoRelation(this.ranges, [start, end], changedRangeIndex);
            }
            newRanges = this._getUpdatedRanges(
                this.ranges,
                changedRangeIndex,
                [start, end],
                oldRelationMode,
                this._steps
            );
            this.ranges = newRanges;
            if (oldRelationMode !== this._relationMode && oldRelationMode === 'normal') {
                this._updateSteps(this.ranges);
            }
        } else {
            const newRanges = this.ranges.slice();
            newRanges[changedRangeIndex] = [start, end];
            this.ranges = newRanges;
        }
    }

    // TODO: https://online.sbis.ru/opendoc.html?guid=51df3deb-24db-42ef-9a79-f71fb367fda5
    get bindType(): string {
        return this._relationMode;
    }

    set bindType(value: string) {
        this._relationMode = value;
    }

    get relationMode(): string {
        return this._relationMode;
    }

    set relationMode(value: string) {
        this._relationMode = value;
    }
    shiftForward(): void {
        this._shift(1);
    }

    shiftBackward(): void {
        this._shift(-1);
    }

    private _shift(delta: number): void {
        this.ranges = this.ranges.map((range) => {
            return Range.shiftPeriod(range[0], range[1], delta);
        });
    }

    private _autoRelation(ranges: TRange[], updatedRange: TRange, changedRangeIndex: number): void {
        let periodType;

        periodType = getPeriodType(updatedRange[0], updatedRange[1]);

        if (this._periodTypeIsDay(periodType)) {
            this._relationMode = 'byCapacity';
        }

        if (ranges.length > 2 || this._relationMode === 'normal') {
            return;
         }

        const updatedStartValue = updatedRange[0];
        const updatedEndValue = updatedRange[1];
        const updatedPeriodType = getPeriodType(updatedStartValue, updatedEndValue);

        let capacityChanged = false;
        if (this._rangeIsNotEmpty(ranges[changedRangeIndex])) {
            capacityChanged = updatedPeriodType !== getPeriodType(
                ranges[changedRangeIndex][0], ranges[changedRangeIndex][1]
            );
        }

        if (changedRangeIndex < ranges.length - 1) {
            this._updateRelation(
                updatedPeriodType, updatedStartValue, ranges[changedRangeIndex + 1][0], capacityChanged
            );
         }
        if (/* this._options.onlyByCapacity && */ changedRangeIndex > 0) {
            this._updateRelation(
                updatedPeriodType, updatedStartValue, ranges[changedRangeIndex - 1][0], capacityChanged
            );
         }
    }

    private _updateRelation(updatedPeriodType: string, updatedStartValue: Date,
                            startValue: Date, capacityChanged: boolean): void {
        let step;

        // The linking is turned on only if we switch to year mode and this means that the offset between periods
        // is a multiple of years in any case, or if the bit width has not changed and the step between periods
        // is a multiple of years.
        if (updatedPeriodType === periodTypes.year || updatedPeriodType === periodTypes.years ||
              (!capacityChanged &&
               updatedStartValue?.getFullYear() !== startValue?.getFullYear() &&
               updatedStartValue?.getMonth() === startValue?.getMonth() &&
               updatedStartValue?.getDate() === startValue?.getDate())) {
           this._relationMode = 'normal';

           // We update steps for calculation of the periods in other controls.
           // If the digit capacity has changed, then adjacent periods are
           // included and the step must be equal to this period.
           if (capacityChanged) {
              step = getPeriodLengthInMonthByType(updatedPeriodType);
           } else {
              step = Math.abs(updatedStartValue.getFullYear() - (startValue?.getFullYear() || 0)) * 12;
           }
           this._resetSteps(step);
        }
    }

    private _updateSteps(dateRanges: TRange[]): void {
        this._steps = [];
        for (const i = 0; i < dateRanges.length - 1; i++) {
            const currentRange = dateRanges[i];
            const nextRange = dateRanges[i + 1];
            if (this._rangeIsNotEmpty(currentRange) && this._rangeIsNotEmpty(nextRange)) {
                this._steps[i] = this._getMonthCount(currentRange[0], nextRange[0]);
            }
        }
    }

    private _rangeIsNotEmpty(range: [Date | null, Date | null]): boolean {
        return range[0] !== null && range[1] !== null;
    }

    private _resetSteps(step: number): void {
        this._steps = [];
        for (let i = 0; i < this.ranges.length - 1; i++) {
            this._steps.push(step);
        }
    }

    private _getMonthCount(start: Date, end: Date): number {
        return end.getFullYear() * 12 + end.getMonth() - start.getFullYear() * 12 - start.getMonth();
    }

    protected _getChangedIndex(ranges: Date[]): number {
        for (const i in this.ranges) {
            if (
                !dateUtils.isDatesEqual(this.ranges[i][0], ranges[i][0]) ||
                !dateUtils.isDatesEqual(this.ranges[i][1], ranges[i][1])
            ) {
                return parseInt(i, 10);
            }
        }
        return -1;
    }

    private _getRangesFromOptions(options: IModel): TRange[] {
        const ranges = [];
        let i;
        let j;
        for (const field in options) {
            if (options.hasOwnProperty(field)) {
                i = null;
                if (field.indexOf('startValue') === 0) {
                    i = parseInt(field.slice(10), 10);
                    j = 0;
                } else if (field.indexOf('endValue') === 0) {
                    i = parseInt(field.slice(8), 10);
                    j = 1;
                }
                if (i !== null) {
                    if (!ranges[i]) {
                        ranges[i] = [];
                    }
                    ranges[i][j] = options[field];
                }
            }
        }
        return ranges;
    }

    private _periodTypeIsDay(periodType: periodTypes): boolean {
        return (periodType === periodTypes.day || periodType === periodTypes.days);
    }

    private _periodTypeIsYears(periodType: periodTypes): boolean {
        return (periodType === periodTypes.year || periodType === periodTypes.years);
    }

    private _getUpdatedRanges(ranges: TRange[], rangeIndex: number, newRange: TRange,
                              relationMode: string, steps: number[]): TRange[] {
        let selectionType: SLIDE_DATE_TYPE = SLIDE_DATE_TYPE.months;
        const start = newRange[0];
        const end = newRange[1];
        const oldStart = ranges[rangeIndex][0];
        const oldEnd = ranges[rangeIndex][1];
        const respRanges = [];
        let periodType;
        let periodLength;
        let oldPeriodType;
        let oldPeriodLength;
        let step;
        let capacityChanged;
        let control;
        let lastDate;
        let i;

        const getStep = (value) => {
            let newStep;
            if (selectionType === SLIDE_DATE_TYPE.days) {
                return periodLength;
            }
            // In the capacity mode we move the periods as adjacent.
            // In the normal mode, if the capacity has changed and the step is not a multiple of the year
            // and the month of the periods differ or step is not aligned to the new capacity,
            // then we also set adjacent periods.
            const isStepDivides = (stepLength: number) => {
                return steps[value] % stepLength === 0;
            };

            const monthsAreEqual = start.getMonth() === oldStart?.getMonth();
            const monthsInYear = 12;

            if (!(this._periodTypeIsDay(periodType) && this._periodTypeIsYears(oldPeriodType)) &&
                relationMode === 'byCapacity' || (capacityChanged && !isStepDivides(monthsInYear) &&
                    periodLength > oldPeriodLength &&  (!monthsAreEqual || !isStepDivides(periodLength)))) {
                newStep = periodLength;
            } else {
                newStep = steps[value] || periodLength;
            }

            if (newStep < periodLength) {
                newStep = periodLength;
            }
            return newStep;
        };

        if (!start || !end) {
            return;
        }

        periodType = getPeriodType(start, end);
        oldPeriodType = (oldStart && oldEnd) ? getPeriodType(oldStart, oldEnd) : null;

        if (this._periodTypeIsDay(oldPeriodType)) {
            oldPeriodLength = Range.getPeriodLengthInDays(oldStart, oldEnd);
        } else {
            oldPeriodLength = oldPeriodType ? Range.getPeriodLengthInMonths(oldStart, oldEnd) : null;
        }

        if (this._periodTypeIsDay(periodType)) {
            if (this._periodTypeIsYears(oldPeriodType)) {
                selectionType = SLIDE_DATE_TYPE.years;
            } else {
                selectionType = SLIDE_DATE_TYPE.days;
            }
            periodLength = Range.getPeriodLengthInDays(start, end);
        } else {
            periodLength = periodType ? Range.getPeriodLengthInMonths(start, end) : null;
        }

        if (this._periodTypeIsDay(periodType) && this._periodTypeIsDay(oldPeriodType)) {
            capacityChanged = periodLength !== Range.getPeriodLengthInDays(oldStart, oldEnd);
        } else {
            capacityChanged = periodType !== oldPeriodType;
        }

        // iterate dates in the controls from the current to the first.
        let endDateStep: number;
        lastDate = start;
        step = 0;
        for (i = 1; i <= rangeIndex; i++) {
            step += getStep(rangeIndex - i);
            control = ranges[rangeIndex - i];
            if (relationMode === 'byCapacity' && !capacityChanged && lastDate > control[1]) {
                respRanges[rangeIndex - i] = ranges[rangeIndex - i];
            } else {
                endDateStep = selectionType === SLIDE_DATE_TYPE.years ? -step : -step + periodLength - 1;
                respRanges[rangeIndex - i] = [
                    this._slideStartDate(start, -step, selectionType),
                    this._slideEndDate(start, endDateStep, selectionType, periodLength)
                ];
            }
            lastDate = control[0];
        }

        respRanges[rangeIndex] = newRange;

        // iterate dates in the controls from the first to the current.
        lastDate = end;
        step = 0;
        for (i = 1; i < ranges.length - rangeIndex; i++) {
            step += getStep(rangeIndex + i - 1);
            control = ranges[rangeIndex + i];
            if (relationMode === 'byCapacity' && !capacityChanged && lastDate < control[0]) {
                respRanges[rangeIndex + i] = ranges[rangeIndex + i];
            } else {
                endDateStep = selectionType === SLIDE_DATE_TYPE.years ? step : step + periodLength - 1;
                respRanges[rangeIndex + i] = [
                    this._slideStartDate(start, step, selectionType),
                    this._slideEndDate(start, endDateStep, selectionType, periodLength)
                ];
            }
            lastDate = control[1];
        }
        return respRanges;
    }

    private _slideStartDate(date: Date, delta: number, selectionType: SLIDE_DATE_TYPE): Date {
        if (selectionType === SLIDE_DATE_TYPE.days) {
            // При проходе днями, смещаемся на нужное количество дней.
            return new this._dateConstructor(date.getFullYear(), date.getMonth(), date.getDate() + delta);
        } else if (selectionType === SLIDE_DATE_TYPE.years) {
            // При проходе годами смещаемся шагами кратными месяцам, но оставлем такую же дату.
            return new this._dateConstructor(date.getFullYear(), date.getMonth() + delta, date.getDate());
        }
        // По умолчанию проходим целыми месяцами с первого по послежний день месяца.
        return new this._dateConstructor(date.getFullYear(), date.getMonth() + delta, 1);
    }

    private _slideEndDate(date: Date, delta: number, selectionType: SLIDE_DATE_TYPE, periodLength: number): Date {
        if (selectionType === SLIDE_DATE_TYPE.days) {
            return new this._dateConstructor(date.getFullYear(), date.getMonth(), date.getDate() + delta);
        } else if (selectionType === SLIDE_DATE_TYPE.years) {
            return new this._dateConstructor(
                date.getFullYear(), date.getMonth() + delta, date.getDate() + periodLength - 1
            );
        }
        return new this._dateConstructor(date.getFullYear(), date.getMonth() + delta + 1, 0);
    }
}

export default ModuleClass;
