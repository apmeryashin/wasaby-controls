import {compare} from 'Types/entity';
import {isValidDateRange} from 'Controls/validate';
import {isDatesEqual} from 'Controls/_utils/dateUtils/Date';

/**
 * Утилиты для работы с периодами дат.
 * @class Controls/_utils/dateUtils/DateRangeUtil
 * @public
 * @author Миронов А.Ю.
 */

export enum SHIFT_DIRECTION {
    BACK = -1,
    FORWARD = 1
}

export function getRangeValueValidators(validators?: Function[] | object[], rangeModel, value): Function[] {
    return [
        isValidDateRange.bind(null, {
            startValue: rangeModel.startValue,
            endValue: rangeModel.endValue
        }),
        ...validators.map((validator) => {
            let _validator: Function;
            let args: object;
            if (typeof validator === 'function') {
                _validator = validator;
            } else {
                _validator = validator.validator;
                args = validator.arguments;
            }
            return _validator.bind(null, {
                ...(args || {}),
                value
            });
        })
    ];
}

export const dateMaskConstants = {
    DD_MM_YYYY: 'DD.MM.YYYY',
    DD_MM_YY: 'DD.MM.YY',
    MM_YYYY: 'MM.YYYY'
};

/**
 * Shifts the period to the adjacent one. If the period is a multiple of the months,
 * the shift occurs for the corresponding number of months. If the period is not a multiple of months,
 * then the shift occurs for the corresponding number of days.
 * @param start {Date}
 * @param end {Date}
 * @param direction Shift direction.
 * @param selectionType
 */
export function shiftPeriod(start: Date, end: Date, direction: number, selectionType?: string): [Date, Date] {
    let result;
    if (compare.isFullInterval(start, end, compare.DateUnits.Month)) {
        result = shiftPeriodByMonth(start, end, direction * getPeriodLengthInMonths(start, end));
    } else {
        let periodLengthInDays;
        if (selectionType === 'workdays') {
            periodLengthInDays = 7;
        } else {
            periodLengthInDays = getPeriodLengthInDays(start, end);
        }
        result = shiftPeriodByDays(start, end, direction * periodLengthInDays);
    }
    return result;
}

/**
 * Shifts the period by several whole months.
 * @param start {Date} Start date of the period.
 * @param end {Date} End date of the period.
 * @param monthDelta The number of whole months on which the period shifts.
 */
export function shiftPeriodByMonth(start: Date, end: Date, monthDelta: number): [Date, Date] {
    return [
        new Date(start.getFullYear(), start.getMonth() + monthDelta, 1),
        new Date(end.getFullYear(), end.getMonth() + monthDelta + 1, 0)
    ];
}

/**
 * Shifts the period by several whole months.
 * @param start {Date} Start date of the period.
 * @param end {Date} End date of the period.
 * @param dayDelta The number of whole days on which the period shifts.
 */
export function shiftPeriodByDays(start: Date, end: Date, dayDelta: number): [Date, Date] {
    return [
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + dayDelta),
        new Date(end.getFullYear(), end.getMonth(), end.getDate() + dayDelta)
    ];
}

/**
 * Returns the length of this period in months. If the period does not represent a whole month
 * it returns undefined.
 * @param start {Date}
 * @param end {Date}
 */
export function getPeriodLengthInMonths(start: Date, end: Date): number {
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth() + 1);
}

/**
 * Returns the length of this period in days.
 * it returns undefined.
 * @param start {Date}
 * @param end {Date}
 */
export function getPeriodLengthInDays(start: Date, end: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.ceil(Math.abs((start.getTime() - end.getTime()) / (oneDay))) + 1;
}

export function getResetButtonVisible(startValue: Date, endValue: Date, resetStartValue: Date,
                                      resetEndValue: Date): boolean {
    const setTimeToZero = (date: Date): void => {
        if (date instanceof Date) {
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
        }
    };
    const values = [startValue, endValue, resetStartValue, resetEndValue];
    for (const value of values) {
        setTimeToZero(value);
    }
    const hasResetStartValue = resetStartValue || resetStartValue === null;
    const hasResetEndValue = resetEndValue || resetEndValue === null;

    return (hasResetStartValue && !isDatesEqual(startValue, resetStartValue)) ||
        (hasResetEndValue && !isDatesEqual(endValue, resetEndValue));
}
